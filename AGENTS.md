# AGENTS.md — TradeOS Cost Book Developer Guide

Essential knowledge for AI agents working in this codebase. For repo/fleet state (current sprint, active branches, what not to touch), read [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md) first — this file is the technical reference, that one is the situational one.

## Current sprint (short version)

Sprint 11 (Project Lifecycle / Operational Workspace) is code-complete but largely **uncommitted in the shared working tree** — run `git status` before assuming what exists. Recommended Sprint 12 is operational hardening, not new surface area. Full detail: [`docs/CURRENT_SPRINTS.md`](docs/CURRENT_SPRINTS.md), [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md).

This repo is worked by a fleet of parallel background agents, each in its own git worktree with its own draft PR. Before starting non-trivial work, check `gh pr list --state all` for overlap, and never push/merge to `main` directly. Full caution list: [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md).

## Big Picture

Two independent deployables, plus one read-only knowledge source:

- **`app/`** — Express/TypeScript API (Node 20+, Prisma, PostgreSQL, forced RLS multi-tenancy)
- **`web/`** — Next.js 16 front-end (React, Server Components, TanStack Query)
- **`packages/knowledge-engine/`** — imported legacy costbook data/scripts/agent pipelines, bridged in read-only via `app/modules/knowledge-runtime/`. See Knowledge Engine section below.

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
7. `npm test && npm run test:integration && npm run build` — all must pass (see Docker limitation below if `test:integration` isn't runnable in your environment)

## Database & Migrations

Source of truth: `app/prisma/migrations/` (timestamp-ordered, tracked by Prisma)

New tables with RLS:

- Write raw SQL in migration (Prisma schema language doesn't express RLS)
- `FORCE ROW LEVEL SECURITY` on the table
- Policies: readers check `org_id = current_app_org_id()`, writers check role
- Child tables join through parent: `exists (select 1 from projects where id = ... and org_id = current_app_org_id())`
- **Test with `npm run test:integration`** (real PostgreSQL, restricted role)
- **Never hand-edit an already-applied migration.** Add a new one. `prisma migrate diff`/`prisma migrate dev` will show near-total schema drift against this project (the first two migrations were hand-written SQL, not Prisma-generated) — that's cosmetic noise, not a signal to apply. Write new migrations by hand, same as the existing ones.

Deploy with `npm run db:deploy`. GitHub Actions wires this in `.github/workflows/deploy-migrations.yml` (only ever verified locally via `act`, never against real GitHub infrastructure — see `docs/AGENT_HANDOFF.md`).

## Testing

**Unit tests** (`npm test`):
- Mock Prisma (see `estimate-engine.service.test.ts`)
- Fast, no external dependencies

**Integration tests** (`npm run test:integration`):
- Disposable PostgreSQL 16 (Docker), restricted `tradeos_app` role
- Prove same-org reads, cross-org denied, viewers blocked
- **New table? Add live test here** — RLS bugs hide in mocked tests. The login-flow RLS chicken-and-egg bug in `AuthService.login` was found only by live HTTP testing, never by the unit suite.
- **Requires Docker + a host `psql` client — see Known Docker Limitation below.** If you can't run this in your environment, say so explicitly rather than reporting full verification.

## Knowledge Engine

`packages/knowledge-engine/` was imported (legacy costbook data, scripts, agent pipelines) and bridged into the live app **read-only** through `app/modules/knowledge-runtime/`:

- Loads JSON/Markdown files from disk (costbook export, assembly index, trade taxonomy, per-assembly/cost-item files, schemas)
- Exposes deterministic search/match endpoints under `/api/v1/knowledge/*` — no Prisma writes, no Supabase import, no vector search/pgvector/RAG, no external AI calls
- Process-memory cached; file changes need a process restart or test-level cache reset
- Trade/assembly coverage is uneven; multiple parallel agents are actively expanding it batch by batch — check `gh pr list --state all` before starting a new import batch to avoid duplicating in-flight work

Full detail: [`docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`](docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md), [`docs/CURRENT_SPRINTS.md`](docs/CURRENT_SPRINTS.md#knowledge-engine-status).

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
| `app/modules/knowledge-runtime/` | Read-only Knowledge Engine bridge |
| `app/prisma/migrations/` | Authoritative schema + RLS |
| `app/tests/rls.integration.ts` | Live RLS verification |
| `web/src/lib/api.ts` | Typed backend client |
| `packages/knowledge-engine/` | Imported legacy knowledge data/scripts (read-only) |

## Gotchas

1. **RLS is forced.** Every service WHERE includes `orgId`. DB enforces; app filters are defense-in-depth.
2. **Request transactions timeout** (60s, `RLS_TRANSACTION_TIMEOUT_MS`). Long work uses `runWithBackgroundDatabaseSession`.
3. **Mocked tests hide RLS bugs.** Live tests catch violations. New tables need one.
4. **Services never see `req`.** They take `orgId` explicitly — testable from workers, CLI.
5. **Org scope inherited via joins.** Resources have `project_id` FK; policies check parent org via join.
6. **No token expiry yet.** If you add `exp`, implement `/api/v1/auth/refresh`.
7. **`supplier_price_updates.supplier_id`/`.material_id` must stay `ON DELETE RESTRICT`**, not `CASCADE` — a prior regression silently destroyed price-update history.
8. **Assembly `isTemplate` is org-scoped, not global.** A `NULL` `org_id` row would be invisible to every tenant under forced RLS — don't try to build a shared template catalog that way.
9. **Never run tenant Prisma queries outside a request/background database session.** Under forced RLS with no session vars set, this silently returns zero rows instead of erroring.
10. **Local `main` may be ahead of (or diverge from) `origin/main`, and the shared working tree may have uncommitted work from other agents.** Always `git status` before assuming repo state or running a destructive git command. See `docs/AGENT_HANDOFF.md` for the current snapshot.

## Known Docker Limitation

`npm run test:integration` and the migration-rollout scripts (`scripts/deploy-migrations.sh`, `scripts/provision-app-role.sh`) need:

1. A running **Docker daemon** (they provision a disposable PostgreSQL 16 container, `tradeos-costbook-test`, on `127.0.0.1:55432`).
2. A **host `psql` client on `PATH`** — not `docker exec`. On macOS/Homebrew, `psql` is keg-only under `libpq` and not linked automatically (`brew install libpq`, then add `/opt/homebrew/opt/libpq/bin` to `PATH`).

If your environment has no Docker access, you cannot run `npm run test:integration` locally — `npm test` alone will pass but does not verify RLS. State this limitation explicitly if you hit it; don't silently skip live verification and report full pass.

## Before Commit

```bash
npm test                  # Unit
npm run test:integration  # Live RLS (needs Docker + psql — see above)
npm run lint               # TypeScript
npm run build               # Compile
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

# Trainingless AI estimating demo (no ML, no external calls)
npm run demo:trainingless-estimate
```

## Help

- **Repo/fleet state, current sprint, cautions** → `docs/AGENT_HANDOFF.md`
- **Sprint tracking** → `docs/CURRENT_SPRINTS.md`, `docs/NEXT_STEPS.md`
- **Architecture** → `docs/TradeOS-CostBook-Architecture.docx`, `docs/SYSTEM_ARCHITECTURE.md`
- **Original roadmap** → `docs/frontend-platform-completion-plan.md`
- **Session-by-session history** → `claude.md`, `docs/rolling-todo.md`, `docs/end-of-session-note.md`
- **Knowledge Engine** → `docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`
- **RLS** → Grep `current_app_org_id()` in migrations
- **Examples** → `cost-database/`, `estimate-engine/`, `proposals/`
