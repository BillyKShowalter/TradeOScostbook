# TradeOS Cost Book — Performance Audit

Repo-wide performance audit covering the Express/Prisma/PostgreSQL backend (`app/`) and the
Next.js 16 frontend (`web/`). Read-only analysis — no fixes applied. Findings are ranked by
estimated impact (how hot the code path is × how bad the failure scenario gets as data grows).

Methodology: full read-through of every service module under `app/modules/*/service.ts`, the
request/auth/DB-session middleware stack, `app/prisma/schema.prisma` and migrations, the
supplier-sync scheduler, and every file under `web/src/app` and `web/src/lib`. No load testing
was run — all estimates are static-analysis based (query counts, transaction counts, missing
limits/caching), not measured latency.

---

## High Impact

### 1. Every authenticated API request pays for two separate DB transactions
**`app/backend/auth/session.ts:8-40`**, **`app/db/requestSession.ts:19-41`**, wired via
**`app/backend/server.ts:50`** (`app.use("/api/v1", requireAuth, databaseSession)`)

`requireAuth` calls `resolveAuthContext`, which opens its own `basePrisma.$transaction` and does
3 `set_config` round trips plus two lookups (`appUser.findUnique`, then
`organizationMembership.findFirst`) just to establish identity. Immediately afterward,
`databaseSession` middleware opens a **second, independent** `$transaction`
(`runWithDatabaseSession`) that re-sets the same three session variables (`app.user_id`,
`app.org_id`, `app.role`) for the actual request work.

Every single `/api/v1/*` call — including a cheap `GET /customers` — pays for 2 full transaction
round trips and at least 5 sequential statements before the endpoint's own logic runs. This is
the single hottest path in the app; it runs on literally every request. Collapsing this into one
transaction (resolve identity as the first statements inside the same transaction that then does
the request's real work) would cut per-request DB round trips roughly in half for the entire API.

### 2. Recursive assembly cost rollup is N+1, unbounded by tree size
**`app/modules/assemblies-database/service.ts:125-149`** (`getAssemblyUnitCost`), calling into
**`app/modules/cost-database/service.ts:129-181`** (`getUnitCost`)

`getAssemblyUnitCost` issues one `findMany` for an assembly's items, then **sequentially awaits**,
per item: a `costDatabase.getUnitCost()` call for every cost-item leaf (which itself does 2 more
queries — `costItem.findFirst` with 3 nested includes, plus an optional `region.findFirst`), or a
full recursive descent for every child assembly (another `findMany` + repeat). There is no
batching, no `Promise.all`, and no memoization — a diamond-shaped tree (the same sub-assembly
referenced from two parents) is walked and re-queried twice even though `visited` only guards
true cycles, not repeated siblings.

Failure scenario: a moderately composed assembly (e.g. 3 sub-assemblies × 5 cost items each) costs
15+ sequential round trips; a deeper catalog-style assembly easily reaches 50-100+. This runs
**live inside a request** every time an estimator "quick adds" an assembly to an estimate
(`EstimateEngineService.addLineItem`, `app/modules/estimate-engine/service.ts:69-76`), and every
time an assembly is priced for display. This is the worst algorithmic finding in the codebase —
cost scales with tree size, not row count, and gets worse as the "common assembly templates"
feature (added recently per project history) encourages building deeper reusable assemblies.

### 3. Nearly every list endpoint is unbounded — no pagination
Confirmed via `grep -rn "findMany(" modules/*/service.ts backend/controllers/*.ts | grep -v take`:
materials (`modules/material-database/service.ts:22`), cost items under a subcategory
(`modules/cost-database/service.ts:50`), equipment, labor rates, suppliers, assemblies (list, not
search), customers (`backend/controllers/projects.controller.ts:87`), projects (`:117`), invoices,
contracts, proposals, and change orders all call `findMany` with **no `take` limit**. Only the two
audit-log reads (membership history, material price history) got pagination — everything else
fetches the entire table for the org on every list call.

Failure scenario: a cost book with a few thousand materials or cost items (the realistic target
size for this product) turns every "browse materials" or "list cost items" call into a full-table
fetch and serialize, with the cost growing linearly and silently — no error, just steadily
increasing latency and payload size until it's a real incident. This is worth fixing before any
customer accumulates a large catalog, not after.

---

## Medium Impact

### 4. In-memory rate-limiter store won't survive horizontal scaling
**`app/backend/middleware/authRateLimit.ts`**, **`app/backend/middleware/platformProvisioningRateLimit.ts`**

Both use `express-rate-limit`'s default in-memory `Map` store (no external store configured).
Deploying more than one API instance — the explicit next step called out in the project's own
rolling notes — makes the configured limits effectively `N × max` instead of `max`, and each
instance's map grows independently with unique-IP cardinality between window resets. Not a bug
today at single-instance scale, but it will silently stop doing its job the moment the app scales
out, with no error to signal the regression.

### 5. Supplier price sync scheduler runs sequentially with no overlap guard
**`app/modules/supplier-integration/scheduler.ts:34-47`** (`runSupplierPriceSyncJobs`) awaits each
configured sync target in a `for` loop rather than `Promise.all`, so N targets take N× the
per-target latency instead of running concurrently. More importantly, `startSupplierPriceSyncScheduler`
(`scheduler.ts:62-83`) has no lock/mutex against re-entry: if a tick's total work ever exceeds the
cron interval, `node-cron` fires the next tick while the previous run is still in flight, launching
overlapping syncs against the same suppliers/materials. Low risk today (the feed fetcher is still a
stub returning `[]`), but this is exactly the kind of latent bug that surfaces the day a real,
slow, network-bound feed is wired in — which project docs already flag as the next step.

### 6. Double-fetch of the same row on a hot write path
**`app/modules/estimate-engine/service.ts:63-67`** (`addLineItem`)

Fetches `costItem.findFirst` directly to read `unitOfMeasure`/`name`, then immediately calls
`costDatabase.getUnitCost()`, which fetches the **same row again** (with heavier nested includes).
Every "add a cost-item line item to an estimate" call pays for this row twice. Small in isolation,
but on the single most frequently used estimate-building action, it's a free win to reuse one
fetch.

### 7. Every client-side fetch pays for a same-origin double hop, with no query caching
**`web/src/app/api/proxy/[...path]/route.ts`**, **`web/src/app/providers.tsx:7`**

Because the session JWT lives in an httpOnly cookie (deliberately, to keep it out of client JS),
every TanStack-Query-driven fetch from a Client Component goes browser → Next.js route handler →
Express API → back, instead of a direct call. That's an intentional, correct security tradeoff,
not a bug — but it compounds with `providers.tsx` constructing `new QueryClient()` with **no
`staleTime`/`gcTime` override**, so React Query's default `staleTime: 0` means every remount and
every window refocus refetches even nearly-static reference data (customer lists, project lists,
cost-item search results) through that double hop. Setting a modest `staleTime` (even 30-60s) on
read-heavy, low-churn queries would cut a meaningful fraction of redundant round trips without
touching the auth architecture.

### 8. PDF binary proxy buffers the whole document in memory instead of streaming
**`web/src/app/api/documents/[...path]/route.ts:23`**

`await upstream.arrayBuffer()` fully materializes the upstream PDF response before sending it to
the browser, instead of piping `upstream.body` straight through
(`new Response(upstream.body, {...})`). Fine at today's document sizes (server-generated
proposals/invoices/contracts via `pdfkit`), but it's an unnecessary full-buffer-in-memory step per
download, and it delays time-to-first-byte on the client until the entire PDF has been fetched
server-side first.

### 9. Project photos bypass Next.js image optimization entirely
**`web/src/components/projects/project-photo-panel.tsx:39`**

`<img src={file.accessUrl} ... className="h-40 w-full object-cover" />` — a raw `<img>` tag, not
`next/image`. The browser downloads the full-resolution photo (these are Supabase-storage-hosted
site-visit photos, which can easily be multi-megabyte camera-phone images) just to display it as a
160px-tall thumbnail. No resizing, no lazy loading, no modern-format (WebP/AVIF) conversion. This
is the most visible/user-facing performance issue found — it directly affects page load weight on
any project page with photos attached, and gets worse as more photos are attached per project.

---

## Low Impact / Notes

- **Bulk cost-item import is row-by-row.** `app/modules/cost-database/service.ts:184-199`
  (`bulkImport`) calls `this.create()` in a loop instead of `prisma.costItem.createMany(...)`.
  Slow for a large CSV, but this is an infrequent admin operation, not a hot path.
- **Cycle-check on assembly writes is one query per node.** `app/modules/assemblies-database/service.ts:151-174`
  (`assertNoCycle`) does a BFS with one `findMany` per visited node when wiring a new child
  assembly. Write-path only, bounded by tree depth/width, acceptable at current scale.
- **Password hashing is correctly async, not a bottleneck.** `app/backend/auth/password.ts` wraps
  `crypto.scrypt` (callback form) in a `Promise`, not `scryptSync` — it does not block the event
  loop. Default cost parameters are reasonable. Each call does consume a libuv threadpool slot
  (default size 4), so a burst of concurrent signups/logins is a capacity-planning consideration,
  not a defect.
- **No memory leaks found.** No per-request `new PrismaClient()` instantiation (one `basePrisma`
  singleton is reused everywhere via `app/db/client.ts`), no unbounded module-level caches, no
  dangling `setInterval`/event listeners (the one `res.once(...)` listener wiring in
  `databaseSession.ts` auto-removes itself).
- **No dependency/bundle bloat found.** Both `app/package.json` and `web/package.json` are lean —
  no `moment`, no whole-`lodash` imports, no oversized PDF/templating stack layered on top of
  `pdfkit`. `jose` (used for non-HS256 JWT verification) is already lazily `import()`-ed only when
  actually needed.
- **Fonts are already optimized** (`next/font/google` in `web/src/app/layout.tsx`) — only images
  were missed.

---

## Suggested Priority Order

1. Collapse the two per-request transactions into one (#1) — smallest code change, benefits every
   single request in the app.
2. Batch/parallelize the assembly cost rollup, or cache resolved child-assembly costs within a
   single top-level call (#2) — highest algorithmic risk, and actively getting worse as the
   template-assembly feature encourages deeper trees.
3. Add `take`/cursor pagination to the unbounded list endpoints (#3) — currently free because test
   data is small; will not stay free.
4. Everything else (#4-#9) is real but lower urgency — worth a follow-up pass, not blocking.
