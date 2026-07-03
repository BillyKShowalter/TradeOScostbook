# Next Steps

Prioritized engineering tasks following the 2026-07-03 repository audit. Ordered roughly by value/effort, not strict sequence — items 1-3 can proceed in parallel.

## 1. Reconcile `AI_ESTIMATING_ARCHITECTURE.md` with `packages/knowledge-engine/`
The architecture doc designs a RAG/retrieval system from first principles; the knowledge engine already has relevant retrieval/reasoning/assemblies content and prompt templates for exactly this kind of pipeline. Someone with domain context should read both and decide what's reusable vs. what should be rebuilt. This is the single highest-leverage reconciliation in the repo right now — building the retrieval layer twice would be a waste.

## 2. Clean up `packages/knowledge-engine/` size and risk items
- Move or remove `agent-skills/skills/` (~66M, generic third-party skills marketplace, not costbook-specific) — see `TECHNICAL_DEBT.md` #2.
- Untrack `legacy-archive/scratch/.npm_cache/` and add it to `.gitignore` — `TECHNICAL_DEBT.md` #1.
- Pick one authoritative `costbook.json` and label/remove the other 6 copies — `TECHNICAL_DEBT.md` #4.

## 3. Scope the knowledge-engine → Prisma schema mapping
Before any data from `packages/knowledge-engine/knowledge/` can reach the live database, someone needs to design the mapping between its flat cost-item/assembly JSON shape and `app/prisma/schema.prisma`'s relational models (separate LaborRate/Material/Equipment FK rows, org scoping, `isTemplate`). This is real design work, not a script — recommend a short spike to produce a field-mapping doc before writing any import code. `packages/knowledge-engine/pipelines/export/sync_manager.py`'s `RelationalSynchronizer` is a plausible starting point to adapt once the mapping exists.

## 4. Update `docs/frontend-platform-completion-plan.md` status
It still says "no login UI yet" and "no customer-facing UI at all," both shipped since. Add a status banner or mark Phases 0–1 complete so the next reader doesn't think there's no frontend.

## 5. Deploy the API somewhere
Database schema and role are live on Supabase; the compiled Express server itself isn't deployed anywhere (`app/vercel.json` is a minimal framework hint, no linked project found). Pick a target (Vercel, Fly, Railway, a VM) and wire it up.

## 6. Resolve the CI approval gate
Required-reviewer protection on the `production` GitHub Environment wouldn't enable despite a GitHub Pro upgrade (a billing-plan quirk, per `docs/end-of-session-note.md`). `workflow_dispatch` migration runs currently execute with no human approval checkpoint. Worth another attempt via the GitHub web UI, or confirming whether this needs an organization-owned repo rather than a personal account.

## Also worth doing, lower urgency
- Remove the dead `signup()`/`login()` helpers in `web/src/lib/api.ts` (superseded by Supabase Auth calls) — `TECHNICAL_DEBT.md` #7.
- Add a real `.env.example` to `web/` — `TECHNICAL_DEBT.md` #10.
- Consolidate the four roadmap files under `packages/knowledge-engine/docs/` — `TECHNICAL_DEBT.md` #6.
- Append a `CLAUDE.md` entry covering the gap between the Proposal/Invoice/Contract UI work and today (project-intake, Engineering Playbook, AI Estimating Architecture, knowledge-engine import, Supabase Auth migration) — `TECHNICAL_DEBT.md` #5.
- Add a real `SupplierFeedFetcher` implementation once a live supplier feed exists (`app/README.md`'s Not Yet Implemented section).

## Developer workflows (verified during this audit)

**Backend (`app/`):**
```bash
npm install && npm run build   # or: npm run dev (ts-node + nodemon)
npm test                        # unit suite, 33 suites
npm run lint                     # tsc --noEmit (type-check only)
npm run test:integration         # disposable Docker Postgres + live RLS suite
npm run db:seed                  # sample data (must run against the admin DB URL)
npm run db:deploy                # prisma migrate deploy + app-role provisioning
```

**Frontend (`web/`):**
```bash
npm install && npm run dev       # or: npm run build && npm run start
npm run lint
```
No test script exists for `web/` yet.

**Knowledge-engine pipeline (`packages/knowledge-engine/`, Python, no `package.json`/venv committed):**
```bash
python3 scripts/run-next-task.py        # pull next queued task, writes runtime/current-task.md
# ...paste the prompt into an agent, it stages output under review/pending/...
python3 scripts/complete-task.py <task-id>   # or scripts/fail-task.py <task-id>
```
Batch-level lifecycle (cost items): `scripts/next-batch.py`, `scripts/approve-batch.py`, `scripts/reject-batch.py`, `scripts/validate_batch.py`. Same pattern for assemblies: `scripts/next-assembly-batch.py`, `scripts/approve-assembly-batch.py`, `scripts/reject-assembly-batch.py`, `scripts/validate-assembly-batch.py`, plus `scripts/audit-assemblies.py`. Full walkthrough in `packages/knowledge-engine/docs/how-to-run-automation.md`.

**Assembly/generation runner:** `python3 pipelines/master_pipeline.py` — runs the full 19-agent, 17-trade generation pipeline (imports per-trade seed agents under `pipelines/generation/seeds/`, assembles items/assemblies, calls into `pipelines/export/sync_manager.py`'s `RelationalSynchronizer`).

**Export generation:** `python3 pipelines/export/publish_to_supabase.py` reads `exports/json/costbook.json` and generates upsert SQL for cost items/assemblies — this is a knowledge-engine-internal export, not currently connected to `app/`'s actual database.

**Migration verification (backend):**
```bash
npm run test:integration   # from app/ — the authoritative way to prove migrations + RLS work together
```
This is the same script (`scripts/deploy-migrations.sh`) used by local dev, the test suite, and `.github/workflows/deploy-migrations.yml`, so there's no drift between how migrations are tested and how they're actually rolled out.
