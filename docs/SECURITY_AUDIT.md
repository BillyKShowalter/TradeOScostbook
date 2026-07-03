# TradeOS Cost Book — Security Audit

**Date:** 2026-07-03
**Scope:** `app/` (Express + Prisma/Postgres API, deployed as an Express app on Vercel) and `web/` (Next.js 16 App Router frontend). Areas reviewed: authentication, authorization, API routes, Supabase integration, JWT handling, secrets/environment variables, file uploads, rate limiting, RLS policies, input validation.
**Method:** Static code review of the full route/controller/middleware surface, all Prisma migrations (including the two newest, `20260702103000_add_project_intake_foundation` and `20260702120000_add_site_visit_intake_result`), the JWT and password modules, `.gitignore`/git history, `.github/workflows/*`, and the Next.js proxy/session layer. No changes were made to production code as part of this audit — this is a read-only report, per the scope of this engagement. Everything below is grounded in code actually read; file:line references are provided so each finding can be re-verified directly.

---

## Executive Summary

TradeOS Cost Book has a genuinely strong foundation: forced Postgres RLS on every tenant table (including the newest migrations, verified consistent with the established `exists (select 1 from projects ...)` inheritance pattern), a correctly-implemented HMAC JWT verifier with no algorithm-confusion path, scrypt+salt+timing-safe password hashing, no secrets in git history, no raw/unparameterized SQL anywhere in the codebase, and a well-configured CI/CD migration pipeline. These are not small things to get right, and they show a deliberate security-conscious build process (documented extensively in the project's own session log).

That said, the audit found **no Critical, remotely-exploitable-today vulnerability in the default configuration**, but it did find several **High** findings that materially weaken defense-in-depth or create real availability/impersonation risk under plausible conditions (a flipped env var, a misconfigured proxy, an attacker with a valid-but-low-privilege token). The two most important:

1. A full authentication-bypass dev flag (`AUTH_ALLOW_HEADER_ORG_ID`) exists in production code, defaults safely off, but grants unauthenticated `owner`-role impersonation of *any* organization the instant it's set to `true`.
2. `trust proxy` is never configured on an Express app deployed behind Vercel's proxy layer, which likely breaks the two IP-based controls that exist (auth rate limiting, provisioning IP allowlist) — either collapsing all users into one shared rate-limit bucket (global DoS via one bad actor) or making the allowlist meaningless.

There is also a real architecture-drift finding: the frontend has migrated from the originally-documented httpOnly-JWT-cookie design to Supabase Auth (`@supabase/ssr`), whose default cookie is **not** httpOnly — but a stale code comment in the proxy route still asserts it is. This doesn't itself grant an attacker anything without a separate XSS bug, but it silently removes a layer this app's own design docs claim exists.

No SQL injection surface, no file-upload attack surface (none exists), no HTML-to-PDF injection/SSRF risk (PDFs are generated programmatically via `pdfkit`, never from HTML), and no credential leakage in git history or client bundles were found.

---

## Critical Vulnerabilities

### C1. `AUTH_ALLOW_HEADER_ORG_ID=true` is a complete, unauthenticated cross-tenant impersonation backdoor
**File:** `app/backend/middleware/auth.ts:30-42`
**Severity:** Critical *if enabled*; the shipped default (`false` in `.env.example`, and not set to `true` in any tracked file) is safe.

```ts
if (process.env.AUTH_ALLOW_HEADER_ORG_ID === "true") {
  const headerOrgId = req.header("x-org-id");
  if (headerOrgId) {
    req.auth = { userId: "dev-header-user", orgId: headerOrgId, role: "owner" };
    req.orgId = headerOrgId;
    next();
    return;
  }
}
```

If this flag is ever set to `true` in a shared, staging, or production environment, **any unauthenticated network client** can send `x-org-id: <any-org-uuid>` with no bearer token at all and be granted full `owner` role over that organization. `resolveAuthContext` (the DB-backed membership check) is never called on this path — there is no JWT verification, no user lookup, no membership check. RLS is fully satisfied because the transaction is bootstrapped with attacker-chosen `app.org_id`/`app.role` values, exactly as if a real owner had authenticated.

This is precisely the kind of flag that gets flipped on temporarily during debugging and forgotten. It is described in code and `.env.example` as "development-only," but nothing in the code itself prevents it from being active in a production `NODE_ENV`.

**Fix (recommended before next production deploy):**
- Hard-fail at server startup if `NODE_ENV === "production"` and `AUTH_ALLOW_HEADER_ORG_ID === "true"` (throw, don't just warn).
- Consider removing the fallback from the deployed build entirely and gating it behind a build-time flag instead of a runtime env var, so it can't be toggled without a redeploy.

---

## High Risk

### H1. Bulk-import endpoints let the client override the server-derived `orgId` (mass assignment) — currently saved only by RLS
**Files:** `app/modules/cost-database/service.ts` (`bulkImport`/`create`), `app/modules/material-database/service.ts` (`bulkImport`/`create`); controllers at `app/backend/controllers/costDatabase.controller.ts:86`, `app/backend/controllers/materialDatabase.controller.ts:46`

The bulk-import schema is `z.object({ rows: z.array(z.record(z.unknown())) })` — no per-field validation, and critically, no stripping of a client-supplied `orgId`. `bulkImport` calls `create({ orgId, ...row })`, so if a row itself contains `orgId`, the spread order lets `row.orgId` win over the server's authenticated `orgId`. Every other create endpoint in this codebase does the reverse — `{ ...schema.parse(req.body), orgId: requireOrgId(req) }`, orgId last, safe — making this an inconsistency with the codebase's own established (and correct) pattern, not a one-off oversight.

**Why this is High and not Critical:** the forced-RLS `with check (org_id = current_app_org_id() and current_app_can_write())` policy on `cost_items`/`materials` (`app/prisma/migrations/20260623180000_enable_org_rls/migration.sql`) blocks the actual cross-org insert today. But the raw Postgres RLS-violation error text is caught and echoed back into the API response's `errors[].message`, which both confirms to an attacker that RLS is the only thing standing in the way and discloses implementation detail. If RLS is ever weakened, this code path is ever refactored to use the non-RLS-scoped Prisma client, or a new tenant table is added without matching policies, this becomes a direct, silent cross-tenant data-injection vulnerability with zero additional exploit steps.

**Fix:** Always set `orgId` from the server-derived value *last* in the spread (`{ ...row, orgId }`), and replace `z.record(z.unknown())` with a real per-row zod schema that doesn't accept `orgId`/`id` from the client at all.

### H2. No rate limiting on any compute-heavy or general business-data route — PDF generation is a real DoS vector
**Files:** `app/backend/server.ts` (entire route table); `app/backend/routes/contracts.routes.ts:10`, `invoices.routes.ts:10`, `proposals.routes.ts:12`

Only two rate limiters exist in the whole backend: `authRateLimit` (signup/login/bootstrap) and `platformProvisioningRateLimit` (organization provisioning). Every other route — including `GET /api/v1/{contracts,invoices,proposals}/:id/pdf`, which synchronously renders a PDF in-process via `pdfkit` on every call, and `POST /api/v1/{cost-database,materials}/.../bulk-import` — has **zero** throttling. Any authenticated user (including a freshly self-signed-up one, since signup is public) can loop PDF requests or bulk-import calls at unlimited speed, generating unbounded CPU work per request with no backoff, capable of starving the Node event loop for every tenant on the instance.

**Fix:** Add a general per-user/org-keyed rate limiter applied globally after `requireAuth`, with a tighter limit specifically on `/pdf`, `/bulk-import`, and `/calculate` routes.

### H3. `trust proxy` is never configured, likely breaking both existing IP-based controls on Vercel
**Files:** `app/backend/server.ts` (missing setting, confirmed absent repo-wide via grep); `app/backend/middleware/authRateLimit.ts`; `app/backend/middleware/platformProvisioningIpAllowlist.ts`; `app/vercel.json` (`"framework": "express"`, confirming Vercel deployment)

Express's `req.ip` defaults to the raw socket address unless `app.set("trust proxy", ...)` is configured to read `X-Forwarded-For` from a trusted hop. This app is deployed on Vercel (per `vercel.json`), which sits its own proxy in front of every request — meaning `req.ip` as currently computed will not reflect real client IPs in production. Both existing IP-keyed controls depend on this being correct:
- `authRateLimit` keys on `req.ip` — if Vercel's internal address is constant/shared across requests, every distinct user shares one rate-limit bucket, so **one abusive user exhausts the login/signup rate limit for all users** (a global self-inflicted DoS), or conversely if it varies unpredictably, the limiter may never trigger at all.
- `platformProvisioningIpAllowlist` (`app/backend/middleware/platformProvisioningIpAllowlist.ts:31`) also reads `req.ip` — the allowlist will either never match a real operator's IP (breaking legitimate provisioning) or, worse, could match unpredictably.

A comment in the allowlist file already acknowledges this is "a second layer, not the primary control," but the underlying `trust proxy` fix was never applied.

**Fix:** `app.set("trust proxy", 1)` (or the specific hop count Vercel's proxy documents) in `app/backend/server.ts`, verified against real request headers in the actual deployment target — and pair IP-based limiting with per-authenticated-user/org keying wherever the route is behind `requireAuth`, so a shared/misattributed IP can't cause a cross-tenant lockout either way.

### H4. Frontend session token is not httpOnly, contradicting this project's own documented security model
**Files:** `web/src/lib/supabase/server.ts:8-25`, `web/src/lib/session.ts`, `web/src/app/api/proxy/[...path]/route.ts:6-9`

The frontend was originally built (per this repo's own session log) with a hand-rolled httpOnly cookie specifically so the JWT would never be readable by client-side JS. It has since migrated to Supabase Auth (`@supabase/ssr`, confirmed live in `web/src/lib/session.ts` — `getSessionToken()` calls `supabase.auth.getSession()`, and every data-fetching Server Action/Component in `web/src/app` imports from `@/lib/session`, not a custom cookie reader). `createClient()` in `web/src/lib/supabase/server.ts` calls `createServerClient(...)` with no `cookieOptions` override, so the session cookie uses `@supabase/ssr`'s library default: **`httpOnly: false`**, and no explicit `secure` flag either.

The comment left in `web/src/app/api/proxy/[...path]/route.ts:6-7` — *"The httpOnly session cookie is only readable server-side"* — is now factually incorrect and actively misleading for anyone maintaining this code; the actual session/access token is readable via `document.cookie` from any script running on the page.

`sameSite: "lax"` (the one part of the default that *is* good) does provide real CSRF protection for cross-site form/fetch submissions, so this is not currently a CSRF issue. The exposure is specifically: **if any XSS bug is ever introduced anywhere on the site, it can read and exfiltrate the live session token directly**, rather than being blocked by `httpOnly` as the code's own comments claim it is.

**Fix:** Pass explicit `cookieOptions: { httpOnly: true, secure: true, sameSite: "lax" }` to `createServerClient` where the SDK supports it, or accept that Supabase's browser client needs some client-readable cookie and instead keep the actual bearer token server-side only (never returned from `getSession()`/`getUser()` to anything that reaches client JS) — and update the stale comment either way so it reflects reality.

---

## Medium Risk

### M1. `adminDashboard` `getOrganization`/`updateOrganization` have no application-level authorization check
**File:** `app/backend/controllers/adminDashboard.controller.ts:10-16`

Every other handler in this controller (`listMembers`, `listMemberHistory`, `upsertMember`, `updateMember`, `removeMember`) calls `requireOrgAccess(req, req.params.id)` (owner/admin + same-org enforcement). `getOrganization` and `updateOrganization` call neither `requireOrgAdmin` nor `requireOrgAccess` — any authenticated member of *any* role (including a plain `estimator`) can call `GET`/`PATCH /api/v1/admin/organizations/:id`. This route is also directly reachable from the browser via the frontend's open `[...path]` proxy (`web/src/app/api/proxy/[...path]/route.ts`), so it is not merely a theoretical API-only gap.

Today this is only saved from being a real IDOR/privilege-escalation by Postgres RLS (`organizations_select_policy`/`organizations_update_policy`, requiring `id = current_app_org_id()` and, for updates, `current_app_can_administer()`) turning any unauthorized attempt into a 404/blocked write. That's a real second layer, but it means this specific endpoint has exactly one functioning control instead of the two every sibling endpoint has.

**Fix:** Add `requireOrgAccess(req, req.params.id)` to both handlers, matching the rest of the controller.

### M2. CORS is fully open (`app.use(cors())`, no origin allowlist)
**File:** `app/backend/server.ts:30`

Called with no options, so the `cors` package's default applies: `Access-Control-Allow-Origin: *` for every route including `/api/v1/*`. No `ALLOWED_ORIGIN`/`CORS_ORIGIN` env var exists anywhere to restrict this per-deployment. Mitigated today because auth is bearer-token-only (no cookie is ever sent to the Express backend directly — the browser always talks to the Next.js proxy, which attaches the header server-side), so a malicious third-party origin can't forge the `Authorization` header via an automatic browser mechanism. But this removes same-origin as a defense-in-depth layer entirely, and severity should be re-evaluated if the architecture ever changes to call the Express API directly from browser JS.

**Fix:** `cors({ origin: [<known frontend origin(s)>], credentials: false })`, sourced from an env var per deployment.

### M3. No security-headers middleware (no `helmet`)
**File:** `app/backend/server.ts:28-32`, confirmed absent from `app/package.json` dependencies

No `X-Content-Type-Options`, `X-Frame-Options`/frame-ancestors CSP, `Strict-Transport-Security`, or `Referrer-Policy` headers are set anywhere. This is most concretely relevant to the server-rendered `/admin` HTML pages (`adminUi.controller.ts`, `adminPricingUi.controller.ts`), which are consequently clickjackable (no frame-ancestors protection) and vulnerable to MIME-sniffing edge cases.

**Fix:** `app.use(helmet())` before the routers.

### M4. Prisma constraint error `meta` (raw DB constraint/column names) is returned to API clients
**File:** `app/backend/middleware/errorHandler.ts` (P2002/P2003 mapping)

`err.meta` — which typically includes literal Postgres constraint or target-column names — is passed through verbatim as the `details` field on 409 responses. This is minor internal-implementation disclosure (aids reconnaissance, e.g. confirming table/column names or that a mass-assignment probe like H1 hit an RLS policy specifically) rather than a direct compromise.

**Fix:** Log `meta` server-side only; return a generic `details` object (or omit it) to the client in production.

### M5. `/admin` HTML console is publicly reachable (unauthenticated GET) with zero rate limiting on its POST handlers
**File:** `app/backend/server.ts:38` (mounted before `requireAuth`), `app/backend/controllers/adminUi.controller.ts`, `adminPricingUi.controller.ts`

`GET /admin`, `/admin/pricing-history`, `/admin/member-history` render with no auth check at all (by design — auth is checked per-`POST` against a bearer token pasted into a form field, with correct role/org-match checks once submitted). This means the admin tool's existence, URL layout, and field/label schema are discoverable by anonymous internet scanning, and the `POST` handlers — each of which does a real JWT-verify + DB transaction — have no rate limit, unlike the comparable `/api/v1/platform` provisioning endpoint which explicitly has both a secret check *and* a rate limiter *and* an IP allowlist.

**Fix:** Put `/admin` behind the same kind of network-level access control already used for `/api/v1/platform` (VPN/IP allowlist), and add rate limiting to its `POST` routes.

### M6. No general per-user/org rate limiting across the CRUD surface
**File:** `app/backend/server.ts` (route table)

Beyond the PDF/bulk-import DoS angle already called out in H2, the entire ordinary CRUD surface (customers, projects, estimates, change orders, invoices, contracts, proposals, supplier integrations) has no throttling of any kind for authenticated traffic — enabling unlimited-speed scripted abuse or ID-enumeration by any signed-up account, low-privileged or not.

**Fix:** Same recommendation as H2 — a general authenticated-user/org-keyed limiter, once H3's `trust proxy` fix makes IP-keying meaningful as a secondary signal.

---

## Low Risk / Informational

### L1. E-signature `signatureDataUrl` has no format or size validation
**Files:** `app/backend/controllers/contracts.controller.ts` (`signSchema`), `app/prisma/schema.prisma` (`signatureDataUrl String?`)

`signatureDataUrl: z.string().optional()` has no `.max()` and no check that the value is actually a `data:image/...;base64,...` payload; it's persisted verbatim to an unbounded `TEXT` column. **Not currently reachable from the actual web frontend** — `web/src/app/(app)/projects/[id]/contracts/[contractId]/sign-form.tsx` only collects `signerName`/`signerEmail` and never sends this field — but it is reachable by any direct API caller with a valid token (or a future/alternate client, e.g. a public signing link). The only practical ceiling today is Express's default 100kb JSON body limit, which is incidental rather than a designed control. Note: the generated contract PDF (`app/modules/contracts/pdf.ts`) never actually embeds this field, so there's no rendering-side injection risk — this is purely a data-integrity/storage-hygiene gap.

**Fix:** Add `.max(N)` and a `data:image/(png|jpe?g);base64,` format check to `signSchema`.

### L2. `app/.gitignore` is not self-sufficient for `.env` exclusion
The root `.gitignore` correctly ignores `.env`, `.env.local`, `.dev-token`, etc., and `app/.env`/`web/.env.local` were confirmed untracked via `git check-ignore -v`. But `app/.gitignore` itself contains only `.vercel`, relying entirely on the root pattern. This works today but is a latent risk if `app/` is ever split into its own repository.

**Fix:** Add `.env`/`.env.local` explicitly to `app/.gitignore` as defense-in-depth.

### L3. `web/proxy.ts` doesn't itself enforce authentication — the real gate is a Server Component layout
**Files:** `web/proxy.ts:4-9`, `web/src/app/(app)/layout.tsx:14-15`

The Next.js proxy (middleware-equivalent) only refreshes the Supabase session cookie; it never checks for a session or redirects. The actual auth gate is `(app)/layout.tsx`'s `if (!session) redirect("/login")`, which happens to run on every request under that route group today. Not currently exploitable, but it means route protection depends on one Server Component staying correct rather than on the routing layer itself — a single accidental removal of that check would silently remove protection with no proxy-level backstop.

**Fix:** Have `proxy.ts` perform the redirect itself for its matched paths, in addition to (not instead of) the layout check.

### L4. Generic frontend proxy (`[...path]` catch-all) forwards any backend path with no allowlist
**File:** `web/src/app/api/proxy/[...path]/route.ts:15`

`/api/proxy/<anything>` forwards verbatim to `/api/v1/<anything>` on the backend with the user's real bearer token attached. Mitigating factors: only `Content-Type`/`Authorization` are forwarded (so `x-platform-provisioning-key` can't be smuggled through to reach platform provisioning), and ultimate authorization still depends on backend-side checks — which is exactly why M1 (missing authz on `getOrganization`/`updateOrganization`) matters more than it otherwise would, since this proxy is a live, no-extra-steps path from any logged-in browser to that endpoint.

**Fix:** Allowlist path prefixes intended for browser use rather than forwarding anything under `/api/v1/`.

---

## What's Solid (verified, not just assumed)

These were specifically checked against real exploit classes and found to be correctly implemented — noted so they aren't second-guessed or "fixed" unnecessarily in the future:

- **JWT verification** (`app/backend/auth/jwt.ts`): HMAC-SHA256 with `crypto.timingSafeEqual` for signature comparison, `exp` checked against server time, optional issuer/audience checks. The HS256 path *always* uses the server's own `AUTH_JWT_SECRET` (never a client-influenced value), and any non-HS256 token is routed to a genuinely separate `jose`-based JWKS verification path (`verifySupabaseToken`) rather than being checked against the same secret — this specifically rules out the classic RS256→HS256 algorithm-confusion attack. An unset/empty `AUTH_JWT_SECRET` throws a 500 rather than silently verifying against an empty key.
- **Password hashing** (`app/backend/auth/password.ts`): `scrypt` with a random 16-byte salt per password and `crypto.timingSafeEqual` for comparison. No passwords logged or returned in any response (confirmed via controller/service review).
- **RLS coverage, including the newest migrations**: every tenant table has `force row level security`, and the two newest migrations (`site_visits`, `project_files`, added 2026-07-02) use the exact same `exists (select 1 from projects where projects.id = <child>.project_id)` inheritance pattern already established and proven for `change_orders`/`categories`/etc. — verified this transitively enforces org scoping because `projects` itself carries the base `org_id = current_app_org_id()` policy, and the subquery runs under the restricted (non-superuser) `tradeos_app` role. No RLS regression in the newest schema changes.
- **No SQL injection surface**: every `$queryRaw` call in the codebase (`app/backend/auth/session.ts`, `app/db/requestSession.ts`, `app/modules/organization-provisioning/service.ts`, `app/modules/auth/service.ts`) uses `Prisma.sql` tagged templates for parameterization; there is no `$queryRawUnsafe`/`$executeRawUnsafe` anywhere in the codebase.
- **No file-upload attack surface**: no `multer`/multipart handling exists anywhere; `project_files.fileUrl` is client-supplied metadata (a URL string), never fetched server-side — no SSRF risk.
- **No HTML-to-PDF injection/SSRF**: all PDF generation (`contracts`, `invoices`, `proposals`) uses `pdfkit`'s programmatic drawing API, never an HTML renderer — rules out both script injection into PDFs and SSRF-via-PDF-fetch.
- **`errorHandler` never leaks stack traces or file paths**: unmapped errors always return a generic `{ error: "Internal server error" }`, with the real error object only ever `console.error`'d server-side.
- **Consistent `orgId`-server-derived-last pattern** everywhere except the two bulk-import call sites (H1) — every other create endpoint correctly prevents client-supplied `orgId` from being trusted.
- **Secrets hygiene**: exhaustive git-history scan (including dangling/unreachable objects) found zero committed secrets, private keys, or real credentials — every credential-shaped string in history is a documented placeholder or clearly-scoped dev/test value. `DATABASE_ADMIN_URL` is confirmed read only by provisioning/migration scripts, never by server runtime code. No `NEXT_PUBLIC_*` variable exposes anything beyond Supabase's intentionally-public anon/publishable key.
- **CI/CD**: `.github/workflows/deploy-migrations.yml` references secrets only via `${{ secrets.X }}`, uses `permissions: contents: read`, has no `pull_request`/`pull_request_target` trigger (so untrusted fork PRs cannot invoke it), and uses a `production` GitHub Environment with a `concurrency` group to prevent racing migrations.
- **Platform provisioning** (`/api/v1/platform/organizations`): constant-time secret comparison, rate limiting, and an optional IP allowlist are all correctly wired and correctly ordered (cheapest check first: rate limit → IP allowlist → secret comparison).

---

## OWASP Top 10 (2021) Review

| Category | Assessment |
|---|---|
| **A01 Broken Access Control** | Primary area of findings. C1 (env-flag auth bypass), M1 (missing app-layer check on org read/update), H1 (mass-assignment orgId override) all live here — but the RLS layer means none is a working exploit in the current default configuration. This is the category most worth prioritizing fixes in, since it's where the app has the most (currently backstopped) single points of failure. |
| **A02 Cryptographic Failures** | Solid. HMAC-SHA256 JWTs with timing-safe comparison, scrypt password hashing with per-user salt, no plaintext secrets in git history. H4 (non-httpOnly session cookie) is the one real gap — not a crypto failure itself, but it removes a layer that's supposed to protect the token from being read once issued. |
| **A03 Injection** | No SQL injection surface found (all raw SQL uses parameterized `Prisma.sql`). No HTML/PDF injection surface. Input validation gap is specifically the bulk-import mass-assignment issue (H1), which is a schema-completeness problem more than classic injection. |
| **A04 Insecure Design** | The `AUTH_ALLOW_HEADER_ORG_ID` dev-bypass flag (C1) and the lack of any rate limiting on compute-heavy routes (H2) are both design-level gaps — features built without the production threat model fully applied. |
| **A05 Security Misconfiguration** | H3 (`trust proxy` unset), M2 (open CORS), M3 (no `helmet`) all fall here. None is exploited today, but together they represent a thin margin of defense-in-depth for an app that otherwise has strong core controls. |
| **A06 Vulnerable and Outdated Components** | Not exhaustively scanned as part of this review (no `npm audit`/dependency-CVE pass was run) — recommended as a fast follow-up, not attempted here since it requires network access to advisory databases and is better run as a dedicated `npm audit`/Dependabot pass. |
| **A07 Identification and Authentication Failures** | Auth/session design is otherwise strong (see "What's Solid"); H4 is the one identification/session-management gap. Password/signup rate limiting (`authRateLimit`) exists but is IP-only and undermined by H3. |
| **A08 Software and Data Integrity Failures** | GitHub Actions workflow is well-configured (least-privilege permissions, no untrusted-PR trigger, environment gating). No CI/build integrity issues found. |
| **A09 Security Logging and Monitoring Failures** | Out of scope for this pass beyond what was directly observed — membership/pricing changes are audited at the DB level (`organization_membership_audits`, `material_price_audits`), which is good, but there is no evidence of centralized security-event logging (failed auth attempts, rate-limit trips, RLS denials) for alerting purposes. Worth a dedicated follow-up. |
| **A10 Server-Side Request Forgery (SSRF)** | Not present — confirmed no server-side fetch of client-supplied URLs anywhere (`project_files.fileUrl` is stored metadata only), and PDF generation never fetches external resources. |

---

## Future Risks (not yet urgent, worth tracking)

- **Dependency/CVE scanning** (A06 above) was not performed as part of this review — recommend adding `npm audit`/Dependabot/Snyk to CI as a follow-up.
- **Security event logging/alerting** (A09 above) — failed logins, rate-limit trips, and RLS-denial patterns aren't currently aggregated anywhere an operator would see them in real time.
- **The dual-auth architecture** (custom HS256 JWTs for the API + Supabase Auth for the frontend, bridged via `verifyAnyAuthToken`'s dual verification path in `app/backend/auth/jwt.ts`) is currently coherent, but is exactly the kind of surface that tends to accumulate drift over time (H4 is an early example of that drift — a stale comment describing security properties that changed when the auth provider changed). Worth a documentation pass reconciling `CLAUDE.md`'s "no token in client JS" claim with the current Supabase-cookie reality, so the next session doesn't build on the outdated assumption.
- **Supplier feed integration** (`SupplierFeedFetcher`, per project history) is still a stub with no real external HTTP fetch implemented. When a live feed is wired up, that's a new SSRF/injection surface that doesn't exist yet and should get its own review at that time.
- **File uploads**: there is no upload surface today (`project_files.fileUrl` is just a stored string), but the schema strongly suggests one is planned. Any future direct-upload implementation should get a dedicated review (content-type validation, size limits, storage-path traversal, virus scanning) before shipping — this audit found nothing to flag only because nothing exists yet.
- **Rate limiting on `/admin`** and the general CRUD surface (M5, M6) should be prioritized before this app has meaningfully more traffic/tenants, since the fix is small and the DoS blast radius grows with usage.

---

## Recommended Fixes — Priority Order

1. **C1** — Hard-fail startup on `AUTH_ALLOW_HEADER_ORG_ID=true` in production; consider removing the fallback from deployed builds entirely.
2. **H3** — Set `trust proxy` correctly for the Vercel deployment; this silently affects two existing controls (auth rate limit, provisioning IP allowlist), so it's a multiplier fix.
3. **H2 / M6** — Add a general per-user/org rate limiter after `requireAuth`, with tighter limits on `/pdf`, `/bulk-import`, `/calculate`.
4. **H1** — Fix the `orgId` spread order in both bulk-import call sites; add real per-row zod schemas.
5. **H4** — Set explicit `cookieOptions` on the Supabase server client (or otherwise stop treating the session token as httpOnly in comments/docs when it isn't); update the stale comment in the proxy route.
6. **M1** — Add `requireOrgAccess` to `getOrganization`/`updateOrganization`.
7. **M2 / M3** — Add `cors({ origin: [...] })` and `helmet()`.
8. **M4** — Stop returning Prisma `meta` verbatim to clients.
9. **M5** — Rate-limit `/admin` POST routes; consider network-level restriction matching `/api/v1/platform`.
10. **L1–L4** — Low-cost hardening: signature field validation, `app/.gitignore` explicit `.env` entry, proxy-level auth redirect, proxy path allowlist.

None of these require an architectural rewrite — every fix above is a scoped, mechanical change (a middleware addition, a spread-order fix, a config object) that fits the existing patterns already used correctly elsewhere in this codebase.
