# AGENTS.md — TradeOS Cost Book Developer Guide
Essential knowledge for AI agents working in this codebase.
## Big Picture
Two independent deployables:
- **`app/`** — Express/TypeScript API (Node 20+, Prisma, PostgreSQL, forced RLS multi-tenancy)
- **`web/`** — Next.js 16 front-end (React, Server Components, TanStack Query)
**Security model:** Bearer JWT + org-membership check + forced PostgreSQL RLS. All three required. Request runs in scoped Prisma transaction with PostgreSQL session vars (`app.user_id`, `app.org_id`, `app.role`) for RLS.
## Module Pattern
Every business module:
```
app/modules/<name>/
  types.ts      (interfaces, DTOs)
  service.ts    (class, async methods, takes orgId param)
```
Services have zero Express knowledge. Controllers add HTTP layer. Routes mount controllers.
## Adding a Feature
1. Extend `service.ts` with org-scoped logic: `findFirst({ where: { id, orgId } })`
2. Add controller method (Zod validation, call service)
3. Add route mounting controller
4. Wire route into `app/backend/server.ts` under `/api/v1`
5. Unit test: mock Prisma, assert shape
6. Integration test: if new table with RLS, verify in `app/tests/rls.integration.ts` against live PostgreSQL
7. `npm test && npm run test:integration && npm run build` — all must pass
## Database & Migrations
Source of truth: `app/prisma/migrations/` (timestamp-ordered, tracked by Prisma)
New tables with RLS:
- Write raw SQL in migration (Prisma schema language doesn't express RLS)
- `FORCE ROW LEVEL SECURITY` on the table
- Policies: readers check `org_id = current_app_org_id()`, writers check role
- Child tables join through parent: `exists (select 1 from projects where id = ... and org_id = current_app_org_id())`
- **Test with `npm run test:integration`** (real PostgreSQL, restricted role)
Deploy with `npm run db:deploy`. GitHub Actions wires this in `.github/workflows/deploy-migrations.yml`.
## Testing
**Unit tests** (`npm test`):
- Mock Prisma (see `estimate-engine.service.test.ts`)
- 60+ tests, seconds
**Integration tests** (`npm run test:integration`):
- Disposable PostgreSQL 16, restricted `tradeos_app` role
- Prove same-org reads, cross-org denied, viewers blocked
- **New table? Add live test here** — RLS bugs hide in mocked tests
- 10+ tests, ~30s
## Error Handling
Centralized in `app/backend/middleware/errorHandler.ts`:
- Controllers throw `ApiError(statusCode, message)`
- Prisma codes: `P2002` → 409, `P2003` → 409, `P2025` → 404
- Zod validation → 400 with issues
- Unmapped → 500
Response: `{ error, details? }` or data.
## Front-End Patterns
**Server Components/Actions** (prefer):
- Token read server-side via `src/lib/api.ts`
- Never in browser JS
**Client Components + TanStack Query**:
- Use `src/app/api/proxy/[...path]/route.ts` (same-origin proxy, attaches token server-side)
- Token never reaches browser
**PDFs** (binary):
- Use `src/app/api/documents/[...path]/route.ts` (arrayBuffer passthrough)
## Key Files
| Path | Role |
|------|------|
| `app/backend/server.ts` | Express setup, routes |
| `app/backend/middleware/auth.ts` | JWT verify, org-membership, set `req.auth` |
| `app/backend/middleware/databaseSession.ts` | Wrap request in transaction, set PostgreSQL vars |
| `app/db/requestSession.ts` | AsyncLocalStorage routing, workers |
| `app/backend/controllers/*.ts` | Zod validation, call service |
| `app/modules/*/service.ts` | Org-scoped business logic |
| `app/prisma/migrations/` | Authoritative schema + RLS |
| `app/tests/rls.integration.ts` | Live RLS verification |
| `web/src/lib/api.ts` | Typed backend client |
## Gotchas
1. **RLS is forced.** Every service WHERE includes `orgId`. DB enforces; app filters are defense-in-depth.
2. **Request transactions timeout** (60s, `RLS_TRANSACTION_TIMEOUT_MS`). Long work uses `runWithBackgroundDatabaseSession`.
3. **Mocked tests hide RLS bugs.** Live tests catch violations. New tables need one.
4. **Services never see `req`.** They take `orgId` explicitly — testable from workers, CLI.
5. **Org scope inherited via joins.** Resources have `project_id` FK; policies check parent org via join.
6. **No token expiry yet.** If you add `exp`, implement `/api/v1/auth/refresh`.
## Before Commit
```bash
npm test                  # Unit
npm run test:integration  # Live RLS
npm run lint              # TypeScript
npm run build             # Compile
```
All must pass. Fix code, not tests.
## Common Commands
```bash
# Dev
cd app && npm run db:deploy && npm run db:seed && npm run dev  # Terminal 1
cd web && npm run dev                                            # Terminal 2
# Deploy
npm run db:deploy
# Test
npm test
npm run test:integration
npm run lint
npm run build
# Workers
npm run jobs:supplier-price-sync
```
## Help
- **Architecture** → `docs/TradeOS-CostBook-Architecture.docx`
- **Roadmap** → `docs/frontend-platform-completion-plan.md`
- **Session** → `CLAUDE.md`
- **RLS** → Grep `current_app_org_id()` in migrations
- **Examples** → `cost-database/`, `estimate-engine/`, `proposals/`
