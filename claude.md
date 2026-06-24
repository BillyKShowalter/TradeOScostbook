# Claude Session Log

## Project
TradeOS Cost Book

## Current State
- Repo root: `/Users/showb/TradeOScostbook`
- Main app lives in `app/`
- Phase 1 hardening is in place:
  - org-scoped request handling exists
  - core service tests pass
  - build and lint pass
- Real auth foundations are now in place:
  - bearer JWT verification
  - user lookup by auth subject
  - organization membership enforcement
  - development-only header fallback gated behind an env flag
- Database auth foundation is now present:
  - `users` table
  - `organization_memberships` table
  - helper functions intended for future RLS policies
- Database-enforced org isolation is now implemented:
  - RLS-compatible identity bootstrap transaction
  - request-scoped Prisma transaction routing via async-local storage
  - transaction-local user, organization, and role settings
  - forced role-aware policies for tenant and inherited child tables
- Change orders were added as a first-class API slice:
  - module service
  - controller
  - routes
  - tests
- Change orders now also support draft-safe editing:
  - update description
  - remove draft line items
  - delete draft orders
- Organization member management endpoints are now live:
  - list organization members
  - provision or upsert a member record
  - update role and status for an existing membership
  - disable a membership through a soft-delete style endpoint
- Organization member management is now hardened:
  - route org scope must match the authenticated org
  - member mutations enforce owner-only rules for owner roles
  - last-active-owner lockout is blocked
  - self-modification is blocked to reduce accidental lockout risk
- Membership change history is now persisted in an audit table with before/after snapshots
- Admins can now read membership history through a dedicated org-scoped endpoint
- Lightweight internal admin UI now exists at `/admin/member-history` for audit inspection
- Broader internal admin shell now exists at `/admin` and `/admin/pricing-history`
- Material price changes now have immutable audit history with admin-only RLS reads
- Disposable PostgreSQL integration testing is automated through `npm run test:integration`
- Background jobs can establish membership-derived scoped database sessions
- Rolling notes exist in:
  - `docs/rolling-todo.md`
  - `docs/end-of-session-note.md`

## Session Rules
- Update this file after every meaningful implementation block.
- End the session with a detailed handoff note for the next session.
- Keep the work on the current roadmap rather than jumping to unrelated refactors.
- Preserve passing `npm test`, `npm run lint`, and `npm run build`.

## Recent Accomplishments
- Added org-aware request helpers and stricter auth fallback behavior.
- Reconciled `db/migrations/0001_init_schema.sql` with Prisma for change-order tables.
- Added service-level tests for cost, assemblies, estimates, admin summary, and change orders.
- Created `docs/rolling-todo.md` and `docs/end-of-session-note.md` to keep the thread oriented.
- Expanded the change-order workflow beyond create/approve into editable draft maintenance.
- Replaced header-only auth with signed bearer JWT validation and org membership checks.
- Added auth seed data and a seeded dev token path for local testing.
- Regenerated the Prisma client after adding user and membership models.
- Added organization member management endpoints, controller validation, service helpers, and coverage tests.
- Hardened member mutations with org-scope checks, owner-only permissions, last-owner protection, and audit writes.
- Added a membership history read endpoint and DTO mapping for audit inspection.
- Added membership history filtering by `actionType`, `dateFrom`, and `dateTo`.
- Added a lightweight server-rendered admin page for browsing membership audit history.
- Aligned the admin history UI with the new membership history filters.
- Added admin UI filter chips and a clearer no-results empty state for membership history searches.
- Added Last 7 days and Last 30 days quick filters to the membership history UI.
- Added database-backed membership history pagination with a fixed 20-row UI page size.
- Added clickable chip-level and clear-all filter controls that preserve identity fields and reset pagination.

## Detailed Session Summary
1. Added a new session-tracking file at the repo root:
   - [claude.md](/Users/showb/TradeOScostbook/claude.md)
   - Purpose: persistent, detailed handoff log for session-by-session continuity
   - Behavior requested by user: update after every implementation block and end each session with a detailed summary

2. Implemented real auth foundations instead of header-only org scoping:
   - Added signed HS256 bearer JWT verification in `app/api/auth/jwt.ts`
   - Added request auth context typing in `app/api/auth/context.ts`
   - Reworked `app/api/middleware/auth.ts` so `/api/v1/*` now requires a valid bearer token by default
   - Middleware behavior now:
     - verifies JWT signature using `AUTH_JWT_SECRET`
     - checks optional issuer and audience claims
     - loads the signed-in user from the database via `auth_subject`
     - enforces organization membership from the database
     - exposes `req.auth` plus `req.orgId` for downstream services
   - Kept a development-only `x-org-id` fallback behind `AUTH_ALLOW_HEADER_ORG_ID=true` so older local workflows can still function when explicitly enabled

3. Added the missing auth data model and schema foundation:
   - Added `users` and `organization_memberships` tables to the SQL migration
   - Added RLS helper functions for future session-based policies:
     - `current_app_user_id()`
     - `current_app_org_id()`
   - Updated Prisma schema with `AppUser` and `OrganizationMembership` models
   - Regenerated the Prisma client so TypeScript sees the new models
   - Seed now creates:
     - a sample user
     - an organization membership for that user
     - a printable dev bearer token for local use

4. Completed the change-order workflow beyond the initial scaffold:
   - Existing work already exposed create/list/get/add-line-item/approve/reject behavior
   - This session added draft-safe maintenance operations:
     - update change-order description
     - remove a draft change-order line item
     - delete a draft change order
   - Added corresponding controller endpoints and routes
   - Added tests covering:
     - sequential CO numbering
     - pricing a line item from a cost item
     - approval flow
     - draft line-item removal and amount recalculation

5. Added membership change history persistence:
   - Added a dedicated `organization_membership_audits` table in both Prisma and the SQL migration
   - Audit rows capture the org, target membership, target user, action, actor metadata, and before/after snapshots
   - Member create/update/disable flows now write audit entries after successful mutations
   - Added a read endpoint for admins to inspect the membership audit trail directly

6. Extended membership history reads with filters:
   - Added service-level filter support for:
     - `actionType`
     - `dateFrom`
     - `dateTo`
   - Added controller query parsing and validation for those filters
   - Added test coverage proving the filtered Prisma query shape
   - Updated the lightweight HTML admin history form so those filters can be used outside direct API calls

7. Added lightweight admin UI:
   - Server-rendered history page mounted at `/admin/member-history`
   - Accepts bearer token, org id, membership id, and optional action/date filters
   - Renders the audit trail in a simple table with expandable snapshots

8. Improved the lightweight admin UI feedback:
   - Added active filter chips for `actionType`, `dateFrom`, and `dateTo` so the applied search state is visible above the results
   - Split the empty state into two clearer cases:
     - no query has been submitted yet
     - a submitted query returned no matching audit rows
   - Added guidance for filtered empty results so admins know to widen date ranges or clear filters
   - Added UI test coverage for the filter-chip and empty-state behavior

9. Added quick date ranges and bounded history navigation:
   - Added Last 7 days and Last 30 days submit controls that work without client-side JavaScript
   - Presets use inclusive calendar ranges and reset the current page to 1
   - Date-to values are translated to `23:59:59.999Z`, preventing same-day audit entries from being excluded after midnight
   - Added `listOrganizationMemberHistoryPage` with:
     - database `count`
     - `skip` and `take`
     - newest-first ordering
     - page clamping when a requested page exceeds the final page
     - a service-side page-size ceiling of 100 rows
   - The internal admin UI uses 20 rows per page and displays the visible row range, total row count, current page, and total pages
   - Added Previous and Next POST controls that preserve authentication, org, membership, and active filters

10. Added clickable filter clearing:
   - Each active action/date chip now includes its own Clear button
   - Added a Clear all filters control beside the chips
   - Clear forms preserve bearer token, organization id, and membership id while omitting the cleared filters
   - Filter changes intentionally omit the page value so the refreshed result starts on page 1

11. Verification status at session end:
   - `npm test` passed
   - `npm run lint` passed
   - `npm run build` passed
   - Current test count: 47 passing tests across 12 suites
   - New coverage verifies preset date boundaries, page reset behavior, service-level pagination/clamping, pagination rendering, visible record ranges, and clear-control hidden fields

12. Supporting docs updated:
   - `docs/rolling-todo.md` now reflects the current focus and next suggested slice
   - `docs/end-of-session-note.md` now points the next session toward auth/RLS or follow-up change-order decisions
   - top-level `README.md`, `app/README.md`, and `app/api/server.ts` were aligned with the new bearer-auth model

13. Notable implementation detail:
   - The change-order module remains org-scoped through the authenticated request context pattern
   - Draft-state enforcement is explicit for edit/delete operations, preventing post-approval mutation
   - Org scoping is no longer driven by request headers alone; it now comes from a verified identity plus a membership lookup
   - Application-level org filters remain in place as defense in depth alongside database policies

14. Added request-scoped database sessions:
   - Added `app/db/requestSession.ts` using `AsyncLocalStorage` to expose the current Prisma transaction without rewriting every service signature
   - Updated `app/db/client.ts` so the exported Prisma proxy routes model calls to the active request transaction and uses the singleton outside request context
   - Added `app/api/middleware/databaseSession.ts` after bearer authentication for all `/api/v1/*` routes
   - Each request transaction sets `app.user_id`, `app.org_id`, and `app.role` with transaction-local PostgreSQL settings
   - Added `RLS_TRANSACTION_TIMEOUT_MS`, defaulting to 60 seconds, to bound request transaction lifetime

15. Made authentication compatible with forced RLS:
   - `resolveAuthContext` now runs in a short bootstrap transaction
   - It sets the signed JWT subject and requested organization as local session values
   - It loads only the matching active user, sets the internal user id, and verifies that user's active membership
   - Request role continues to come from the membership row rather than trusting the token role

16. Added `db/migrations/0002_enable_org_rls.sql`:
   - Enables and forces RLS for users, memberships, organizations, membership audits, direct tenant tables, and child tables
   - Viewers can read current-org operational data
   - Estimators, admins, and owners can write operational data
   - Admins and owners can administer memberships and inspect/append audit rows
   - Child scope is inherited through divisions, assemblies, estimates, projects, and change orders
   - Ordinary tenant sessions intentionally cannot insert organizations; a dedicated provisioning workflow is required

17. RLS verification status:
   - `npm test` passed with 47 tests across 12 suites
   - `npm run lint` passed
   - `npm run build` passed
   - Added tests for request session propagation/cleanup and the required SQL policy contract
   - Live PostgreSQL cross-tenant integration coverage remains the first task for the next session

18. Completed live PostgreSQL RLS verification:
   - Provisioned a disposable PostgreSQL 16 container named `tradeos-costbook-test` on `127.0.0.1:55432`
   - Added `app/scripts/test-integration-db.sh` and `npm run test:integration` to rebuild the database, apply migrations `0001` then `0002`, and create a restricted `tradeos_app` login
   - Added `app/tests/rls.integration.ts`, which runs tenant operations through the non-superuser role rather than PostgreSQL's RLS-bypassing superuser
   - Live assertions now prove same-org reads succeed, cross-org reads are hidden, cross-org writes fail, viewers cannot write, and admins can read membership history
   - Updated RLS policies to cache stable session-helper calls and added missing tenant-key indexes following PostgreSQL RLS performance guidance

19. Added secure organization provisioning:
   - Removed the old organization-create endpoint from the tenant admin router
   - Added `POST /api/v1/platform/organizations`, authenticated with a separate `x-platform-provisioning-key` matched in constant time
   - Added `PLATFORM_PROVISIONING_SECRET`, which must contain at least 32 characters or the route fails closed with 503
   - Provisioning runs in a dedicated transaction and atomically creates the organization, owner user, owner membership, and initial membership audit snapshot
   - Extended RLS with a transaction-local provisioning flag that permits only the newly generated current organization and its initial identity records
   - Added middleware tests for valid, invalid, and missing provisioning configuration
   - Added a live integration assertion proving provisioning succeeds through the restricted application database role under forced RLS

20. Added background-job database sessions:
   - Added `runWithBackgroundDatabaseSession` in `app/db/requestSession.ts`
   - Worker callers provide only job name, organization id, and internal user id
   - A bootstrap transaction verifies the user is active and has an active membership, then derives the role from the database
   - The final transaction is tagged with `app.session_source=job:<name>` and receives the same forced-RLS restrictions as HTTP work
   - Unit tests cover invalid job names and inactive/missing memberships
   - Live integration proves a viewer worker can read same-org rows but still cannot write

21. Added immutable material price history:
   - Added `material_price_audits` to SQL and Prisma with organization/material indexes
   - Added forced RLS: admins/owners can read; estimator/admin/owner writes may append through material updates; no update/delete policy exists
   - Material unit-cost updates now write old/new cost, material snapshot name, source, actor user, actor role, and timestamp in the same transaction
   - Metadata-only material edits do not create false price history
   - Added `GET /api/v1/admin/organizations/:id/pricing-history` with material id/name, source, date, and limit filters
   - Live integration proves admins can read the audit while viewers receive no rows

22. Expanded the internal admin shell:
   - Generated and saved the active design concept at `docs/design/admin-shell-concept.png`
   - Added the pricing/audit workspace at `/admin` and `/admin/pricing-history`
   - Added stale-price summary, filtered material price history, and recent membership activity in a table-first responsive layout
   - Added shared external CSS at `/admin/assets/admin.css` rather than adding more inline style attributes
   - Updated the legacy membership page to execute its service query inside an RLS database session
   - Added view/service tests for price history and shell rendering

23. Final verification and UI QA:
   - `npm test` passes with 56 tests across 16 suites
   - `npm run lint` passes
   - `npm run build` passes
   - Latest `npm run test:integration` passes 8 live PostgreSQL tests
   - Browser testing authenticated against the disposable database and rendered real price/member audit data
   - Desktop 1440x1000 implementation was compared directly against the generated concept with `view_image`
   - Mobile 390x844 testing found a wide-table grid overflow; min-width/max-width containment was patched and rebuilt
   - The final post-fix browser reload could not run because elevated-command approval quota was exhausted while restarting the local API; this is the first QA action for the next session

24. Closed the mobile QA recheck and found/fixed a second overflow bug:
   - Restarted the disposable `tradeos-costbook-test` PostgreSQL container (it was already up from the prior session), confirmed migrations `0001`/`0002` were present, recreated `app/.env` (not committed) pointing `DATABASE_URL` at the restricted `tradeos_app` role, regenerated the Prisma client, and reseeded sample data with `db:seed`
   - Rebuilt and started the API with `npm run build && npm start`, verified `/health`
   - Installed Playwright (Chromium) ad hoc into `/tmp/shotenv` (not added to the project) since no project browser-driving skill or `chromium-cli` was available, and used it to load `/admin/pricing-history`, authenticate via the seeded dev token, and submit a `PATCH /api/v1/materials/:id` price change first so the price-history table would actually render a row
   - The original wide-table overflow fix (`.data-panel`/`.activity-panel`/`.table-scroll` containment) held correctly — confirmed via `document.documentElement.scrollWidth` measurement, not just visual inspection
   - Found a **second, previously-undetected** horizontal overflow at 390px: the `@media(max-width:760px)` `.admin-layout{grid-template-columns:1fr}` rule collapses the layout to one column, but `.sidebar` (and its `nav`) had no `min-width:0`, so the CSS Grid auto-minimum sizing let the nowrap tab row (`Overview/Members/Pricing/Audit trail`) push the single `1fr` track ~18px wider than the viewport (`scrollWidth: 408` vs `clientWidth: 390`), even though the nav's own `overflow-x:auto` was working
   - Fixed by adding `min-width:0` to both `.sidebar` and `.sidebar nav` inside the existing 760px media query in `api/views/adminShell.view.ts` — `scrollWidth` now matches viewport exactly (390px) and the tab row scrolls internally as intended
   - Re-ran the full verification ladder after the fix: `npm test` (56/56, 16 suites), `npm run lint`, `npm run build` — all pass

25. Added a committed run/screenshot skill at `app/.claude/skills/run-tradeos-costbook-api/`:
   - `driver.mjs` provisions the disposable `tradeos-costbook-test` Postgres container (idempotent reuse, or `--fresh` to recreate), seeds sample data via the admin role, writes `.env` for the restricted `tradeos_app` role, builds and backgrounds the API with a `/health` poll, and drives the admin UI with Playwright (now a real devDependency, not an ad hoc `/tmp` install) to log in and screenshot any route/viewport
   - `driver.mjs shot` prints `scrollWidth` vs `clientWidth` so future mobile-overflow regressions show up as a number mismatch, not just something an agent has to notice by eye
   - Verified the whole `db --fresh -> seed -> serve -> shot -> stop` pipeline from a clean state (recreated container, fresh `.env`/token) before writing it up, and again afterward following `SKILL.md` literally line-by-line
   - Found and fixed a real bug while building this: `db/seed/seed.ts` is only idempotent for org/user/membership — reseeding an already-seeded container throws a Prisma unique-constraint error on `divisions`. `driver.mjs all` always forces `--fresh` for this reason; documented as a Gotcha in `SKILL.md`
   - Also caught and fixed a driver bug where a stray leftover server process from manual testing earlier in the session caused `serve`'s health check to pass against the *wrong* process while the freshly-spawned one had already crashed on `EADDRINUSE` — `serve` now checks `lsof -ti :4000` up front and fails loudly instead of silently succeeding
   - Added `.dev-token`, `.dev-server.pid`, and the skill's `screenshots/` directory to `.gitignore`
   - `npm test` (56/56, 16 suites), `npm run lint`, and `npm run build` all still pass with `playwright` added as a devDependency

26. Hardened platform organization provisioning with rate limiting and an optional IP allowlist:
   - Added `api/middleware/platformProvisioningRateLimit.ts` using `express-rate-limit` (new dependency), IP-scoped since no tenant identity exists yet at provisioning time, defaulting to 5 requests per 15 minutes, configurable via `PLATFORM_PROVISIONING_RATE_LIMIT_MAX` / `PLATFORM_PROVISIONING_RATE_LIMIT_WINDOW_MS`
   - Added `api/middleware/platformProvisioningIpAllowlist.ts`, an optional comma-separated `PLATFORM_PROVISIONING_ALLOWED_IPS` allowlist that is a no-op when unset (so existing local/test/dev setups don't silently break) and normalizes IPv4-mapped IPv6 addresses before matching
   - Wired both into `api/routes/organizationProvisioning.routes.ts` ahead of the existing constant-time secret check, so brute-force/DoS attempts against the secret are throttled or blocked before the comparison even runs
   - Documented in `.env.example`, `README.md` (including the trust-proxy caveat: the allowlist relies on accurate `req.ip`, so it's a backstop, not a substitute for infrastructure-level network controls)
   - Added `tests/platformProvisioningIpAllowlist.test.ts` and `tests/platformProvisioningRateLimit.test.ts` (the latter via `supertest` against a minimal Express app, since `express-rate-limit` needs real request/response plumbing)
   - Live-verified against the running API: 5 requests with a wrong provisioning key correctly return 401, the 6th returns 429, proving the rate limit triggers before the secret check
   - `npm test` (61/61, 18 suites), `npm run lint`, and `npm run build` all pass

27. Started supplier queue persistence — a queued-review staging area for supplier-fed price proposals, wired through `runWithBackgroundDatabaseSession`:
   - Added `supplier_price_updates` to `db/migrations/0001_init_schema.sql` (status `pending`/`approved`/`rejected`, snapshotting `current_unit_cost` at proposal time) and forced RLS to `db/migrations/0002_enable_org_rls.sql`: any org member can read the queue, write-capable roles (estimator/admin/owner) can enqueue, but only admin/owner can review (approve/reject) — a deliberately tighter bar than ordinary writes, since approval is what actually changes a live price
   - Added the matching `SupplierPriceUpdate` Prisma model and relations (`Organization`, `Supplier`, `Material`, `AppUser.reviewedSupplierPriceUpdates`)
   - Added `modules/supplier-integration/{types,service,worker}.ts`: `SupplierIntegrationService` has `enqueue`, `listQueue`, `approve` (applies the price, writes a `material_price_audits` row, marks the queue row approved, atomically in one transaction), `reject`, and `syncFromFeed` (skips quotes that don't actually change the price or that already have a pending proposal for the same material). `runSupplierPriceSyncJob` in `worker.ts` is the actual `runWithBackgroundDatabaseSession` entry point — no HTTP route, meant for a future scheduler/cron consumer to call
   - The live feed fetch itself (`SupplierFeedFetcher`) is still a stub returning no quotes — there's no real supplier API to integrate with yet — but it's injectable via the service constructor so a real implementation can be added later without touching the queue/review/worker plumbing
   - Removed the old dead `MaterialDatabaseService.syncSupplierFeed` stub it superseded (was unwired to any route, never tested)
   - Added HTTP surface at `/api/v1/supplier-integrations/queue` (list/enqueue) and `/queue/:id/approve|reject` (admin-only at the controller level via `requireOrgAdmin`, in addition to the RLS restriction)
   - Added unit tests for the service (enqueue/approve/reject/syncFromFeed, including the duplicate-pending and no-change skip logic) and the worker (confirms it calls `runWithBackgroundDatabaseSession` with the right job name and identity)
   - Extended `tests/rls.integration.ts` with a live test: a viewer-role background job is blocked from enqueueing, an estimator-role job can enqueue but not approve, and an admin approving correctly updates the material price and writes the audit row — all run against real PostgreSQL through the restricted `tradeos_app` role
   - Live-verified the full HTTP flow against the running API: enqueue → list → approve (price + audit updated correctly) → re-approve correctly 409s → enqueue → reject (price left untouched)
   - Found and documented a pre-existing gap while doing this: there is no supplier CRUD API at all (suppliers can only be created directly against the database) — added to README's Not Yet Implemented list
   - `npm test` (68/68, 20 suites), `npm run test:integration` (9/9 live RLS tests), `npm run lint`, and `npm run build` all pass

28. Added a supplier CRUD API, closing the gap found in item 27:
   - Added `modules/supplier-database/{types,service}.ts` and `api/{controllers,routes}/supplierDatabase.{controller,routes}.ts`, mounted at `/api/v1/suppliers` (`GET/POST /` and `GET/PATCH/DELETE /:id`) — mirrors the existing `equipment-database` module's structure exactly
   - `apiIntegrationKey` is write-only: the DTO never returns the raw value, only `hasApiIntegrationKey: boolean`, since it's a credential placeholder and the suppliers table has no extra read restriction beyond ordinary org-scope RLS (any org member, including viewers, can read supplier rows)
   - While building this, caught that `supplier_price_updates.supplier_id`/`material_id` had been given `on delete cascade` in the previous session — meaning deleting a supplier or material would silently wipe its price-update history (including already-approved/rejected rows). Changed both to `on delete restrict` in `db/migrations/0001_init_schema.sql` and the matching Prisma relations, matching the existing `material_price_audits.material_id` restrict pattern exactly
   - Added unit tests for the service (including the API-key masking behavior) and extended `tests/rls.integration.ts` with a live test: viewer cannot create a supplier, admin can, and deleting a supplier with existing price-update history is correctly rejected by the database
   - Live-verified the full HTTP CRUD lifecycle (create → list/get confirm key masked → update → delete → 404) and the FK-restrict protection (enqueued a price update against a supplier, confirmed delete then fails) against the running API
   - Documented in README; removed the "no supplier CRUD API" line from Not Yet Implemented and added a more precise gap instead: this app has no friendly mapping of DB constraint violations to clean error responses anywhere, not just for suppliers — deleting a protected supplier returns a generic 500, consistent with (not a regression from) how every other module already handles this
   - `npm test` (73/73, 21 suites), `npm run test:integration` (10/10 live RLS tests), `npm run lint`, and `npm run build` all pass

29. Added a scheduler/cron consumer for `runSupplierPriceSyncJob`, closing that gap from item 27:
   - Decided against platform-wide auto-discovery of organizations/suppliers — that would need a database connection that bypasses RLS, which background jobs in this app are deliberately never given (per `db/requestSession.ts`'s existing design). Instead, sync targets are configured explicitly as `{orgId, userId, supplierId, label?}` tuples via `SUPPLIER_PRICE_SYNC_JOBS` (JSON array, zod-validated)
   - Added `modules/supplier-integration/scheduler.ts`: `parseSupplierPriceSyncJobSpecs`, `runSupplierPriceSyncJobs` (runs every target in sequence, isolating failures — one bad spec doesn't stop the rest), and `startSupplierPriceSyncScheduler` (wires it to `node-cron`, no-ops when `SUPPLIER_PRICE_SYNC_CRON_SCHEDULE`/`SUPPLIER_PRICE_SYNC_JOBS` aren't both set, throws loudly on an invalid cron expression rather than silently failing)
   - Added `node-cron` + `@types/node-cron` as dependencies; added `scripts/` to `tsconfig.json`'s `include` so the new CLI script gets type-checked like everything else
   - Wired `startSupplierPriceSyncScheduler` into `api/server.ts`'s `require.main === module` startup block — an optional in-process timer for operators who don't want external cron infrastructure
   - Added `scripts/run-supplier-price-sync.ts` (`npm run jobs:supplier-price-sync`) as the alternative path for operators who'd rather drive this from external cron / a k8s CronJob / a systemd timer — reads the same `SUPPLIER_PRICE_SYNC_JOBS`, runs once, exits non-zero if any target failed so the external scheduler can alert
   - Added unit tests for the scheduler (parsing, per-spec failure isolation, no-op-when-unconfigured, invalid-cron-throws, and that a captured cron tick actually invokes every spec)
   - Live-verified three things against the real disposable database: the CLI script runs a valid spec successfully and a deliberately-bogus spec fails independently (script exits 1, both results logged); the in-process scheduler logs nothing when unconfigured; and — using a real `* * * * *` schedule — the in-process timer actually fires on its own after a real minute boundary and runs both configured jobs, not just registers them
   - `npm test` (82/82, 22 suites), `npm run test:integration` (10/10 live RLS tests), `npm run lint`, and `npm run build` all pass

30. Added a Prisma constraint-violation-to-4xx error mapper, closing that gap from item 28:
   - Added `mapPrismaKnownRequestError` and wired it into the existing centralized `errorHandler` in `api/middleware/errorHandler.ts`: `P2002` (unique constraint) → 409, `P2003` (foreign key constraint, e.g. the supplier/material RESTRICT protections from items 27–28) → 409, `P2025` (record not found) → 404, with Prisma's `meta` attached as `details`
   - Deliberately scoped to only the three codes this app has actually hit — any other `PrismaClientKnownRequestError` code still falls through to the generic 500 rather than guessing at a status for codes never observed in practice
   - This benefits every controller automatically — no module needed its own try/catch, and no existing behavior changed for errors that were already mapped (`ApiError`, `ZodError`) or for errors RLS denial already produces (still 500, unaffected, since RLS violations aren't one of the three mapped codes)
   - Added `tests/errorHandler.test.ts` covering all three mapped codes plus the two unaffected fallback paths (unmapped Prisma codes, arbitrary errors)
   - Live-verified against the running API: creating a division with a duplicate `(orgId, code)` now returns a clean 409 instead of 500; deleting a supplier with price-update history now returns a clean 409 with the violated constraint name in `details`, instead of the 500 from the previous session
   - `npm test` (89/89, 23 suites), `npm run test:integration` (10/10 live RLS tests), `npm run lint`, and `npm run build` all pass

31. Started (and substantially completed) production migration rollout automation, resolving a real architectural conflict: the project had two parallel migration mechanisms — hand-written SQL files in `db/migrations/` that the README called "authoritative" and applied manually via `psql`, plus unused `prisma migrate dev`/`prisma migrate deploy` npm scripts pointing at a `prisma/migrations/` folder that didn't exist. Asked the user to confirm direction before touching this (adopt Prisma Migrate vs. a custom tracking mechanism; include role provisioning or not) — both recommended options were chosen.
   - Baselined the two hand-written SQL files verbatim into real, timestamped `prisma/migrations/` history (`20260623143000_init_schema`, `20260623180000_enable_org_rls`) plus `migration_lock.toml`. Verified byte-for-byte schema equivalence between a database built via `prisma migrate deploy` and one built via the old manual two-file `psql` path (`pg_dump --schema-only` diff, identical apart from `pg_dump`'s random per-run restrict tokens), then ran the full live RLS integration suite against the Prisma-migrated database to prove behavioral equivalence too — `prisma migrate deploy` is now the one authoritative, tracked production rollout command
   - Added `scripts/sql/provision-app-role.sql` (idempotent create-or-update of the restricted role + grants + `alter default privileges` so future migrations' new tables aren't silently left ungranted) and `scripts/provision-app-role.sh` (the env-driven wrapper — `DATABASE_ADMIN_URL`, `APP_DB_ROLE_PASSWORD`, optional `APP_DB_ROLE_NAME`). Password is never committed; it's substituted via `psql -v` at runtime
   - Added `scripts/deploy-migrations.sh`: `prisma migrate deploy` (via `DATABASE_ADMIN_URL`) followed by app-role provisioning if `APP_DB_ROLE_PASSWORD` is set — the one command to wire into CI/CD or a manual release step
   - Hit and fixed two real issues while building this: psql doesn't substitute `:'var'`-style variables inside dollar-quoted (`DO $$...$$`) blocks, so the create-or-alter-role branch had to be restructured around `\gexec` instead of PL/pgSQL; and newer `psql` (18+) rejects Prisma's `?schema=public` connection-string query parameter outright rather than ignoring it, so the wrapper strips the query string before invoking `psql`
   - Rewrote `scripts/test-integration-db.sh` to call `scripts/deploy-migrations.sh` instead of hand-rolling its own `psql`-file-application logic — the test harness and production rollout now share one path, eliminating the drift risk that caused this whole problem in the first place. Also updated the run skill's `driver.mjs db` command, which had its own third independent copy of the same logic, to call the same scripts
   - Deleted `db/migrations/0001_init_schema.sql`/`0002_enable_org_rls.sql` (confirmed identical to the new baselined copies first) and the now-empty root `db/` directory — one source of truth instead of three
   - Updated `tests/rlsMigration.test.ts` to read from the new `prisma/migrations/.../migration.sql` path
   - Live-verified idempotency explicitly: running `deploy-migrations.sh` a second time against an already-migrated, already-provisioned database reports "No pending migrations to apply" and `ALTER ROLE` (not `CREATE ROLE`); running it with `APP_DB_ROLE_PASSWORD` unset correctly skips the role step with a warning instead of failing
   - Found a real environment gap while doing this: the sandbox had no host `psql` client at all (only ever used via `docker exec`). Installed it via `brew install libpq` (keg-only, not symlinked onto `PATH` by default) and documented this as a Prerequisite in `app/README.md` and the run skill's `SKILL.md`, since `psql` is now a real dependency of the rollout scripts (not of the running API itself)
   - Added `npm run db:deploy` and `npm run db:provision-role`; added `DATABASE_ADMIN_URL`/`APP_DB_ROLE_PASSWORD`/`APP_DB_ROLE_NAME` to `.env.example` with clear separation from the restricted runtime `DATABASE_URL`
   - `npm test` (89/89, 23 suites — unchanged, no test logic touched), `npm run test:integration` (10/10, now exercising the real rollout path), `npm run lint`, and `npm run build` all pass

32. Wired `scripts/deploy-migrations.sh` into a GitHub Actions workflow, the CI/CD example flagged as still missing in item 31:
   - Added `.github/workflows/deploy-migrations.yml`: `workflow_dispatch` (manual) plus an automatic trigger on pushes to `main` touching `app/prisma/migrations/**` or the deploy/provisioning scripts. Runs against a `production` GitHub Environment (so required-reviewer protection can be configured in repo settings — a real rollout should never be just a green CI run) with least-privilege `permissions: contents: read` and a `concurrency` group that queues rather than cancels overlapping runs, since migrations aren't safe to race
   - This repo has no git history/remote (confirmed — `git status` fails with "not a git repository"), so the workflow can't actually be triggered on GitHub from here. Installed `actionlint` and `act` (`brew install actionlint act`) to verify it as thoroughly as possible without that: `actionlint` for static validation (clean, no findings), and `act` to genuinely *run* the workflow's job inside an actual GitHub Actions runner image against the real disposable Postgres container
   - The `act` run succeeded end-to-end: checked out, installed `psql` + dependencies, ran `scripts/deploy-migrations.sh`, applied both migrations, and provisioned the role — then ran it a second time and confirmed idempotency inside the actual workflow ("No pending migrations to apply" + `ALTER ROLE` not `CREATE ROLE`), the same proof point as the script-level verification in item 31, now at the workflow level
   - Documented the exact verification command in the workflow file's own header comment (so it's discoverable in place, not just in a session log) and in `app/README.md`'s migrations section
   - `npm test` (89/89, 23 suites), `npm run test:integration` (10/10), `npm run lint`, and `npm run build` all still pass (no application code touched this round, only the new workflow file and docs)

33. Merged `/admin/member-history` into the shared admin-shell visual system, the last open item on the rolling TODO. Asked the user to confirm direction first (merge vs. leave as-is vs. something else) since it was an open decision, not an assigned task — chose to merge
   - Extended `adminShellCss` (`api/views/adminShell.view.ts`) with the CSS the membership page needed that the shared stylesheet didn't have yet: filter chips (`.chip`/`.chip-form`/`.chip-clear`), pagination (`.pagination`/`.pagination-form`), snapshot `<details>`/`<pre>` styling, and a 4-column `.access-panel.with-membership form` variant (the pricing page's access form only has 3 fields; this one needs a 4th for membership ID) — including the same 1100px/760px responsive overrides the 3-column version already had, so the new variant degrades the same way
   - Rewrote `renderMembershipHistoryPage` in `api/controllers/adminUi.controller.ts` to emit the shared `.admin-layout`/`.sidebar`/`.topbar`/`.access-panel`/`.data-panel` markup instead of its own standalone dark-themed page (own `<style>` block, `.wrap`/`.card`/`.two-col` classes) — kept every existing helper function (`getAppliedFilters`, `renderFilterChip`, `renderClearAllFilters`, `renderPagination`, `renderHiddenFields`, `applyDatePreset`, `renderSnapshot`, `renderEmptyState`, etc.) completely unchanged, since the merge is a visual/chrome change only, not a logic change
   - Both "Members" and "Audit trail" sidebar nav links now mark themselves active on this page (they already both pointed at `/admin/member-history`; this just makes that visually honest)
   - One test assertion (`tests/admin-ui.controller.test.ts`) checked the old page's literal heading text ("Membership history") — updated it to the new heading's actual Title Case copy ("Membership History"), matching `/admin/pricing-history`'s style; this is the only test change, and it's asserting copy, not behavior
   - Live-verified visually, not just via tests: seeded data, created a real membership via the API to generate an actual audit row (so the populated-table state was checked, not just the empty state), and screenshotted the page at both 1440×1000 and 390×844 — confirmed `scrollWidth === clientWidth` at both (no overflow regression of the kind found earlier this session) and visually confirmed the table, chips, pagination-ready layout, and sidebar nav all render correctly and match the pricing-history page's established look
   - `npm test` (89/89, 23 suites, one assertion updated), `npm run test:integration` (10/10), `npm run lint`, and `npm run build` all pass

34. Added common assembly templates for quick adding to estimates:
   - Discovered that `POST /api/v1/estimates/:id/line-items` already accepted `assemblyId` and resolved its recursive rolled-up unit cost in a single call — "quick adding an assembly to an estimate" was already fully solved; what was actually missing was a way to mark/discover which assemblies are reusable starting points ("common templates") versus one-off assemblies built for a specific job. Scoped the work to exactly that gap rather than building a redundant or conflicting mechanism
   - Added `isTemplate Boolean @default(false)` to the `Assembly` model + a new migration `20260624083000_add_assembly_is_template` — hand-wrote the migration SQL rather than using `prisma migrate dev`'s auto-diff, after `prisma migrate diff` revealed the diff engine wanted to rewrite primary keys, column types (`uuid`→`TEXT`), and every constraint/index name across nearly the entire schema (cosmetic noise from how the originally-hand-written SQL differs structurally from what Prisma's own generator would produce, not anything that needed to actually change). This is the first real migration added since the production-migration-automation work; it proved that workflow handles incremental schema changes correctly, not just the initial baseline
   - Decided against a cross-tenant shared template catalog: a `NULL` `org_id` row would be invisible to every tenant under forced RLS (`org_id = current_app_org_id()` is never true for `NULL`), so templates are necessarily per-org, not a shared system-wide library
   - Added `AssembliesDatabaseService.listTemplates(orgId)`, `isTemplate` passthrough on create/update, `GET /api/v1/assemblies/templates` (mounted before `/:id` to avoid route-param capture, same pattern as the existing `/search` route)
   - Seeded one realistic template ("Residential Driveway Base Package," composed of the two cost items the seed script already creates) in `db/seed/seed.ts`
   - Added unit tests for the service (listTemplates filtering, isTemplate passthrough on create/update) and a live RLS integration test (viewer blocked from creating a template, admin can, cross-org visibility correctly denied)
   - Live-verified the complete flow against the running API: queried `/assemblies/templates`, confirmed the seeded template's rolled-up unit cost (47.55 from two component cost items), created an estimate, and quick-added the template as a single line item in one call (correct unit cost × quantity = line cost, description auto-filled from the template name)
   - `npm test` (93/93, 23 suites), `npm run test:integration` (11/11 live RLS tests), `npm run lint`, and `npm run build` all pass

35. Created the real GitHub repo and ran the production migration workflow for real against a live Supabase database, closing the two biggest "only verified locally" gaps remaining:
   - `git init`, excluded `.claude/settings.local.json` (had a throwaway dev JWT baked into one allowlist entry), committed, `gh repo create --private` + push. Push was initially rejected — the `gh` token lacked the `workflow` scope to push `.github/workflows/*.yml`; fixed via `gh auth refresh -s workflow`
   - Created the `production` GitHub Environment. Required-reviewer protection rules would not enable via the API even after the user upgraded to GitHub Pro (`"Please ensure the billing plan supports the required reviewers protection rule"`) — proceeded without that gate rather than block indefinitely on a possible billing-propagation delay; flagged clearly as unresolved, since it means `workflow_dispatch` runs currently execute with no approval checkpoint
   - Set `DATABASE_ADMIN_URL`/`APP_DB_ROLE_PASSWORD` as environment secrets pointing at a real Supabase project, with the user setting the values directly (never pasted to me) — except a real database password ended up in the chat twice anyway during troubleshooting (once in a full connection string, once in a malformed paste); both times had the user rotate it immediately via the Supabase dashboard before anything used the exposed value
   - Found and fixed a real infrastructure bug: Supabase's direct connection host (`db.<ref>.supabase.co:5432`) is IPv6-only without the paid IPv4 add-on; GitHub Actions hosted runners are IPv4-only, so every attempt failed with `P1001: Can't reach database server`. Fixed by switching to Supabase's Session-mode Supavisor pooler (`aws-1-us-west-2.pooler.supabase.com:5432`, user `postgres.<project-ref>`) — confirmed via Supabase's docs that Session mode, not Transaction mode (which doesn't support prepared statements/DDL), is correct for migrations from an IPv4-only environment
   - The real run succeeded: all 3 tracked migrations applied, `tradeos_app` role provisioned. Verified directly against the live database via the Supabase MCP tools rather than trusting the green checkmark — 24 tables including `assemblies` and `supplier_price_updates`, the role exists, forced RLS (`relrowsecurity`/`relforcerowsecurity`) both true on `organizations` and 22 other tables
   - The actual API application is still not deployed anywhere — only the database schema and role exist in production now. That's the natural next step

## Next Suggested Slice
- Resolve why required-reviewer protection rules won't enable on the `production` Environment despite GitHub Pro — try the web UI, or check whether this needs an Organization-owned repo rather than a personal account.
- Deploy the actual API application somewhere (Vercel/Fly/Railway/a VM) pointed at the now-live Supabase database via the `tradeos_app` role.
- Configure infrastructure-level network controls around platform provisioning, now that there's a real deployment target to apply them to.
- Add a real `SupplierFeedFetcher` implementation once an actual supplier feed exists to integrate with — the CRUD API, queue/review/worker plumbing, scheduler, and clean error responses are all ready now; only the live feed transport is missing.
- Consider seeding a few more realistic common assembly templates (a deck package, a bathroom remodel, a kitchen refresh) now that the `isTemplate` mechanism exists — only one ("Residential Driveway Base Package") was added so far.
- Re-run the full verification ladder after each block.

## Local Dev Environment Notes (not committed)
- `app/.env` is gitignored and was recreated this session pointing at the disposable `tradeos-costbook-test` Docker container (`127.0.0.1:55432`, db `tradeos_test`) using the restricted `tradeos_app` role for `DATABASE_URL`.
- Seeding (`npm run db:seed`) must run against the **admin/superuser** Postgres URL (`postgres:tradeos_test@127.0.0.1:55432/tradeos_test`), not `tradeos_app` — forced RLS blocks ordinary tenant sessions from inserting organizations by design, so seeding as the restricted role will fail.
- The seeded dev bearer token is regenerated each time `db:seed` runs (depends on `AUTH_JWT_SECRET` in `.env` at seed time); it is not durable across sessions and should be treated as throwaway.

## Working Agreement Reminder
- Keep updating this file after each meaningful block.
- End every session with a detailed note in this file so the next session can resume without re-reading the repo.
- Keep the rolling TODO and end-of-session note aligned with this more detailed log.
