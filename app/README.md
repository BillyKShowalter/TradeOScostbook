# TradeOS Cost Book — API (MVP Backend)

Node.js + TypeScript + Express backend implementing the MVP modules from the planning documents in [`../docs`](../docs): Cost Database, Labor Database, Material Database, Equipment Database, Assemblies Database, Estimate Engine, Proposal Generator, and Admin Dashboard.

Database access uses Prisma against PostgreSQL/Supabase. `prisma/migrations/` is the authoritative, tracked migration history (Prisma's own `_prisma_migrations` bookkeeping table records what's been applied) — `prisma/schema.prisma` is the matching ORM schema. There is no separate hand-written SQL file outside this directory; RLS policies and helper functions that Prisma's schema language can't express are committed as raw SQL inside `prisma/migrations/<name>/migration.sql`, the same as any other migration.

## Project Structure

```
backend/                 (renamed from api/)
  server.ts            Express app entrypoint, route mounting, middleware
  routes/               One router per module (18 route files)
  controllers/          Request validation (zod) + calls into module services (18 controllers)
  middleware/            error handling, auth, rate limiting, request-scoped RLS sessions
  auth/                  JWT verification, password hashing, session bootstrap
  views/                 Server-rendered admin shell views
db/
  client.ts              Prisma client with request transaction routing
  requestSession.ts      Async-local transaction and PostgreSQL session values
  seed/seed.ts           Sample data seed script
modules/
  cost-database/         Division/Category/Subcategory/CostItem hierarchy + unit cost calc
  labor-database/        Labor rates, burdened rate, labor cost calc
  material-database/     Materials, waste factor, bulk import, stale-price detection
  equipment-database/    Equipment ownership/operating cost, hourly/daily cost calc
  assemblies-database/   Composed cost items (supports nested assemblies), recursive roll-up
  estimate-engine/        Pricing formulas (formulas.ts) + estimate/line-item orchestration
  proposal-generator/     PDF proposal generation (pdfkit)
  admin-dashboard/        Org settings, pricing-update review queue
  auth/                  Email/password signup and login
  change-orders/         Draft-safe change-order lifecycle
  contracts/             Signature capture, PDF rendering
  invoices/              Full and progress-billed invoices, PDF rendering
  organization-provisioning/  Platform-key-gated first-owner org creation
  project-intake/        AI-assisted site-visit classification/confidence scoring
  proposals/             Persisted proposal entity with delivery-status lifecycle
  supplier-database/     Supplier contact CRUD
  supplier-integration/  Supplier price-update queue, review, scheduler, worker
prisma/
  schema.prisma           ORM schema (30 models)
  migrations/              Tracked migration history (9 migrations; source of truth for schema + RLS)
scripts/
  deploy-migrations.sh     Production rollout: prisma migrate deploy + app-role provisioning
  provision-app-role.sh    Idempotent restricted-role create/update + grants
  run-supplier-price-sync.ts  One-shot external-cron entry point for supplier price sync
tests/                    Jest test suite (34 files: nearly every module, RLS, auth, admin UI)
```

Each module under `modules/` exposes a `types.ts` (interfaces) and `service.ts` (the class implementing its logic), independent of Express — the API layer in `backend/` is a thin adapter on top. `backend/` was renamed from `api/`; if you see `api/...` paths in older docs or session logs, read them as `backend/...`.

The server also exposes an internal admin page at `/admin/member-history` for browsing membership audit history with a bearer token, org id, and membership id — it shares the same visual shell (layout, palette, table/chip/pagination styling) as `/admin` and `/admin/pricing-history`, not a separately-styled page.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local Postgres, or a Supabase project's connection string)
- A `psql` client on `PATH` — required by `scripts/deploy-migrations.sh`/`scripts/provision-app-role.sh`, not by the running API itself. On macOS via Homebrew, `psql` is keg-only: `brew install libpq` and add `$(brew --prefix libpq)/bin` to `PATH`.

## Setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL, DATABASE_ADMIN_URL, and APP_DB_ROLE_PASSWORD
```

## Running Migrations

`prisma/migrations/` is the authoritative, tracked migration history. **Migrations and the restricted application role must be applied/provisioned through an elevated connection** (`DATABASE_ADMIN_URL`) — the role the running API connects as (`DATABASE_URL`) is deliberately never given permission to run DDL or grant privileges to itself.

For a fresh database, or to roll out a new migration to an existing one:

```bash
npm run db:deploy           # = scripts/deploy-migrations.sh: prisma migrate deploy, then (re)provisions the app role
npm run prisma:generate
```

`scripts/deploy-migrations.sh` is the one command to wire into CI/CD or a manual release step — it's the same path `npm run test:integration` exercises on every run, so there's no drift between how this gets tested and how it actually gets deployed. It's idempotent: re-running it after nothing has changed reports "No pending migrations to apply" and updates (rather than recreates) the application role.

[`../.github/workflows/deploy-migrations.yml`](../.github/workflows/deploy-migrations.yml) is a worked GitHub Actions example calling this script: manually dispatchable, or triggered automatically on a push to `main` that touches `app/prisma/migrations/**`. It runs against the `production` GitHub Environment, reading `DATABASE_ADMIN_URL`/`APP_DB_ROLE_PASSWORD`/`APP_DB_ROLE_NAME` from that environment's secrets — configure required reviewers on the `production` environment (repo Settings → Environments) so a real rollout always needs a human approval, not just a green CI run. Verified locally with [`act`](https://github.com/nektos/act) (`brew install act`) against the disposable test database — see the workflow file's header comment for the exact command.

If you only need to (re)provision the role — e.g. to rotate its password — without touching schema:

```bash
npm run db:provision-role
```

For local development against a schema you're actively iterating on (not a tracked production rollout), `npm run prisma:migrate` (`prisma migrate dev`) still works as usual and will prompt to create a new migration for any drift from the last one.

Forced RLS applies even to the table owner, so deploying request-session code (`db/requestSession.ts`) before or atomically with any migration that adds `force row level security` to a new table is required — the same constraint that existed when these were hand-written SQL files.

## Seeding Sample Data

```bash
npm run db:seed
```

This creates one sample organization, a Sitework → Excavation → Residential Excavation hierarchy, a labor rate, a material, an equipment record, two cost items, a customer, a project, and one common assembly template (see below) — enough to immediately exercise the estimate → proposal flow below.

Assemblies can be flagged `isTemplate: true` (`GET/POST /api/v1/assemblies`, filterable via `GET /api/v1/assemblies/templates`) to mark them as reusable starting points an estimator browses for quick adds, as distinct from one-off assemblies built for a specific job. Adding one to an estimate is unchanged — `POST /api/v1/estimates/:id/line-items` already accepted `assemblyId` and resolves its rolled-up unit cost in one call, regardless of whether it's flagged as a template. Templates are org-scoped, not a shared cross-tenant catalog: forced RLS hides a `NULL` `org_id` row from every tenant (`org_id = current_app_org_id()` is never true when `org_id` is `NULL`), so each org maintains its own template library rather than drawing from a shared system-wide one.

## Running the API

```bash
npm run dev      # ts-node + nodemon, restarts on file change
# or
npm run build && npm start
```

The API listens on `http://localhost:4000` by default (see `PORT` in `.env`). Health check: `GET /health`.

All `/api/v1/*` routes run through bearer-token auth (`backend/middleware/auth.ts`): the middleware verifies an HS256 JWT, resolves the signed-in user, and checks that the user belongs to the requested organization. The remaining request runs in a Prisma transaction with transaction-local `app.user_id`, `app.org_id`, and `app.role` PostgreSQL settings so forced RLS can enforce the same boundary in the database. A development-only `x-org-id` fallback can be enabled with `AUTH_ALLOW_HEADER_ORG_ID=true`, but it is off by default.

`RLS_TRANSACTION_TIMEOUT_MS` controls request transaction lifetime and defaults to 60 seconds. Long-running or queued work should run outside HTTP request handlers with its own scoped database session.

Background workers should call `runWithBackgroundDatabaseSession`. It verifies an active membership and derives the worker role from the database before opening the scoped job transaction. `modules/supplier-integration/worker.ts`'s `runSupplierPriceSyncJob` is a working example: it has no HTTP route and is invoked by the scheduler described below instead.

First-owner organization creation is isolated at `POST /api/v1/platform/organizations`. It requires `x-platform-provisioning-key` to match the separately configured `PLATFORM_PROVISIONING_SECRET` and atomically creates the organization, owner identity, owner membership, and initial audit record. The route is rate-limited per client IP (`PLATFORM_PROVISIONING_RATE_LIMIT_MAX` per `PLATFORM_PROVISIONING_RATE_LIMIT_WINDOW_MS`, defaulting to 5 per 15 minutes) and supports an optional `PLATFORM_PROVISIONING_ALLOWED_IPS` allowlist as defense in depth. Keep this route behind network controls in production — the in-app allowlist is a backstop, not a substitute for infrastructure-level restrictions.

For local development, seed the database and then use the printed dev token from `npm run db:seed`, or sign your own JWT with `AUTH_JWT_SECRET`. The token must include `sub`, `orgId`, and `role` claims.

## Trying the Core Loop End-to-End

After seeding:

```bash
# 1. Create an estimate against the seeded project (replace <projectId> with the seeded project's id)
curl -X POST localhost:4000/api/v1/estimates -H "Content-Type: application/json" \
  -d '{"projectId": "<projectId>", "overheadPct": 10}'

# 2. Add a line item referencing the seeded cost item (replace ids accordingly)
curl -X POST localhost:4000/api/v1/estimates/<estimateId>/line-items -H "Content-Type: application/json" \
  -d '{"costItemId": "<costItemId>", "quantity": 25}'

# 3. Set markup-mode pricing
curl -X POST localhost:4000/api/v1/estimates/<estimateId>/pricing-mode -H "Content-Type: application/json" \
  -d '{"mode": "markup", "markupPct": 20}'

# 4. Generate the PDF proposal
curl -X POST localhost:4000/api/v1/estimates/<estimateId>/proposals/generate -o proposal.pdf
```

(Note: the proposal route is mounted at `/api/v1/proposals/:id/generate`, where `:id` is the estimate id — adjust the example above accordingly.)

## Testing

```bash
npm test
npm run lint             # tsc --noEmit type-check; no separate linter configured
npm run test:integration
```

`npm run test:integration` recreates a disposable PostgreSQL 16 Docker container, applies every tracked migration in `prisma/migrations/` via `scripts/deploy-migrations.sh` (not a hardcoded pair of files), creates a restricted non-superuser application role, and proves RLS behavior against the live database. Coverage includes same-org access, cross-org read/write denial, viewer write denial, admin audit access, provisioning, background-job scope, and material price history visibility.

The internal admin shell is available at `/admin`, `/admin/pricing-history`, and `/admin/member-history`. The first two provide stale-price summaries, filtered immutable material price history, and recent membership activity; the third is the focused membership audit utility (filter by action type/date range, paginated, with per-membership before/after snapshots) — all three now share one visual system (`backend/views/adminShell.view.ts`'s CSS and layout), not separately-styled pages.

`GET/POST /api/v1/suppliers` and `GET/PATCH/DELETE /api/v1/suppliers/:id` manage supplier contact records. `apiIntegrationKey` is write-only — responses only ever report `hasApiIntegrationKey: true/false`, never the stored value. Deleting a supplier that has any `supplier_price_updates` history (pending, approved, or rejected) fails: that foreign key is `ON DELETE RESTRICT`, the same protection `material_price_audits` gives materials.

Supplier-fed price changes are staged for review rather than applied automatically: `POST /api/v1/supplier-integrations/queue` enqueues a proposal (snapshotting the material's current price), `GET /api/v1/supplier-integrations/queue` lists the queue (filterable by `status`/`supplierId`/`materialId`), and `POST /api/v1/supplier-integrations/queue/:id/approve` or `/reject` resolves it — approval applies the price change and writes the same `material_price_audits` trail a manual edit would, and is restricted to admin/owner by RLS (an estimator can enqueue but not approve). The actual feed fetch (`SupplierIntegrationService`'s `fetchFeed` constructor argument) is still a stub returning no quotes — see Not Yet Implemented below — but the queue, review, audit, and worker plumbing around it are real and RLS-enforced.

`runSupplierPriceSyncJob` is triggered one of two ways — there's no platform-wide auto-discovery of organizations/suppliers, since that would need a database connection that bypasses RLS, which this app deliberately never gives background jobs (each sync target must be listed explicitly, naming the org, supplier, and an existing user with an active membership in that org to run as):
- **In-process scheduler** (`modules/supplier-integration/scheduler.ts`, started from `api/server.ts`): set both `SUPPLIER_PRICE_SYNC_CRON_SCHEDULE` (a standard 5-field cron expression) and `SUPPLIER_PRICE_SYNC_JOBS` (a JSON array of `{orgId, userId, supplierId, label?}`) and the API process runs every configured target on that schedule. Leave either unset and it no-ops at boot.
- **External cron / k8s CronJob / systemd timer**: run `npm run jobs:supplier-price-sync` on your own schedule instead. It reads the same `SUPPLIER_PRICE_SYNC_JOBS`, runs each target once, logs per-target results, and exits non-zero if any target failed (so the external scheduler can alert) — without needing the in-process timer at all.

Either path isolates failures per target: one job spec with a bad `userId` or revoked membership logs an error and is skipped, it doesn't stop the rest of the configured targets from running.

The centralized error handler (`backend/middleware/errorHandler.ts`) maps the common Prisma constraint-violation codes to clean 4xx responses instead of a generic 500: `P2002` (unique constraint, e.g. a duplicate division code) → 409, `P2003` (foreign key constraint, e.g. deleting a supplier or material with price-update/audit history) → 409, `P2025` (record not found) → 404. Every controller benefits from this automatically; no module needed its own try/catch. Prisma error codes this app hasn't actually encountered yet still fall through to the generic 500 rather than guessing at a status — see `mapPrismaKnownRequestError` if you need to add one.

## Not Yet Implemented (by design, MVP scope)

- Production migration rollout automation and managed secret configuration (provisioning now has app-level rate limiting and an optional IP allowlist, but infrastructure-level network controls — security groups, ALB rules — still need to be configured per deployment)
- Live supplier price feed ingestion — `SupplierIntegrationService`'s feed fetcher is still a stub returning no quotes; the queue/review/audit/worker/scheduler persistence it would feed into is implemented and RLS-enforced
- Auto-discovery of which organizations/suppliers to sync — targets are listed explicitly via `SUPPLIER_PRICE_SYNC_JOBS` rather than discovered, since discovery would need a database connection that bypasses RLS
- A production deployment target for this API (schema/role provisioning exists against a live Supabase project; the compiled server itself isn't deployed anywhere yet — see `docs/PROJECT_STATUS.md`)

Note: a customer-facing frontend now exists — see [`../web/`](../web/) — this section only tracked backend-side gaps as of the original MVP scope.
