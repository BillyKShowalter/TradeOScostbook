# Agent Handoff

Read this first if you are landing in this repo cold. Snapshot as of **2026-07-03**.

## What this repo is

TradeOS Cost Book: a cloud estimating/pricing and now project-operations platform for trade contractors. Two independent deployables:

- **`app/`** — Express/TypeScript API (Node 20+, Prisma, PostgreSQL, forced RLS multi-tenancy)
- **`web/`** — Next.js 16 front-end (App Router, Server Components, TanStack Query)

Plus a newly-imported, currently read-only knowledge source:

- **`packages/knowledge-engine/`** — migrated legacy costbook data, scripts, and agent pipelines, bridged into the app read-only through `app/modules/knowledge-runtime/`

For the module pattern, security model, and day-to-day dev commands, see [`AGENTS.md`](../AGENTS.md). This document is about **repo state and coordination**, not code structure.

## Current sprint

**Sprint 11** (Project Lifecycle / Operational Workspace) is code-complete but **sitting uncommitted in the shared working tree** — it turned the project detail page into a tabbed operational workspace (field dashboard, structured site visits, project tasks, richer change orders, a derived activity timeline) and wired AI Estimate Assist to real data through the new Knowledge Runtime bridge. Full detail in [`docs/CURRENT_SPRINTS.md`](CURRENT_SPRINTS.md). **Recommended Sprint 12** is operational hardening (persisted event log, customer-facing change-order acceptance, a real warranty module, document versioning, AI review telemetry) — also detailed there, with near-term action items in [`docs/NEXT_STEPS.md`](NEXT_STEPS.md).

**Do not trust `git log` alone to tell you what's done.** Run `git status` in the shared checkout before assuming a feature does or doesn't exist — a large amount of Sprint 11 work, plus the Knowledge Engine import's follow-on wiring, is present only in the working tree or in a local commit not yet pushed.

## Repo/branch state — read before touching git

- Local `main` is **one commit ahead of `origin/main`**: `e31c1c8` ("chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines") is committed locally but not pushed.
- On top of that, the shared working tree (the main checkout, *not* a worktree) has substantial **uncommitted** changes: most of `app/backend/`, `app/modules/`, `web/src/**`, `app/prisma/schema.prisma`, plus several new untracked modules (`ai-estimate-assist`, `knowledge-runtime`, `project-tasks`, `trainingless-estimate-demo`) and new docs. This is Sprint 11's actual code.
- **This is a multi-agent fleet repo.** Many background agents work in parallel, each in its own `.claude/worktrees/<name>` on its own `worktree-<name>` branch, each opening its own draft PR against `main`. As of this snapshot, open draft PRs include (topic, not exhaustive — run `gh pr list --state all` for the live list):
  - full repository audit + legacy-tradeos-reference transfer docs
  - repo-wide performance audit report
  - full contractor experience design (lead-to-paid)
  - dead-code removal / duplicate consolidation
  - security audit (`docs/SECURITY_AUDIT.md`)
  - DB audit + `pg_trgm` search indexes
  - legacy Knowledge Engine bridge planning + typed import stubs
  - v1.0 release checklist / launch plan / known limitations
  - Knowledge Runtime bridge module scaffold
  - Knowledge Engine batch imports (e.g. "Tree Service — Batch 01")
  - proposal-facing UI components
  - an AI-estimating-architecture doc (already **merged**, PR #10)
  - one auth/RLS bugfix PR (**closed**, superseded)
- **Coordinate before merging.** Because so many agents touch overlapping areas (docs, Knowledge Engine, RLS/DB), assume another agent may already be mid-flight on something that looks like a gap. Check `gh pr list --state all` before starting new work in a commonly-touched area (docs/, packages/knowledge-engine/, migrations).
- Never push directly to `main`, never force-push, never merge someone else's draft PR without being asked. Work in your own isolated worktree and open your own draft PR, exactly as this session did.
- Before any destructive git command (`checkout`/`restore`/`reset`/`clean`) in the **shared** checkout, run `git status` first — there is a lot of other agents' unfinished work sitting there.

## Knowledge Engine status

- Imported at `e31c1c8` (local-only, not pushed) into `packages/knowledge-engine/` — data, scripts, and agent pipelines carried over from a legacy costbook project.
- `app/modules/knowledge-runtime/` bridges it into the live app **read-only**: loads JSON/Markdown files from disk (`packages/knowledge-engine/exports/json/costbook.json`, `knowledge/knowledge/assembly-index.json`, `knowledge/knowledge/trade-progress.json`, `knowledge/knowledge/trade-taxonomy/taxonomy.md`, `knowledge/knowledge/assemblies/*.json`, `knowledge/knowledge/cost-items/*.json`, `schemas/*.json`) and exposes deterministic search/match endpoints under `/api/v1/knowledge/*`.
- No Prisma writes, no Supabase import, no vector search/pgvector/RAG, no external AI calls, no automatic estimate writes — every match is a human-reviewed suggestion. See [`docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`](KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md), [`docs/TRAININGLESS_AI_ESTIMATING_DEMO.md`](TRAININGLESS_AI_ESTIMATING_DEMO.md), [`docs/TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md`](TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md).
- Runtime is process-memory cached — file changes need a process restart or a test-level cache reset.
- Trade/assembly coverage is uneven across categories; several parallel agent branches are actively expanding it batch by batch (see fleet list above). Check for an in-flight PR before starting a new import batch.
- Full detail: [`docs/CURRENT_SPRINTS.md`](CURRENT_SPRINTS.md#knowledge-engine-status).

## What agents should not touch (without a specific reason and explicit review)

- **`prisma/migrations/`** — never hand-edit an already-applied migration's `migration.sql`. Add a new migration. Also: never trust `prisma migrate diff`/`prisma migrate dev` blindly against this schema — the original migrations were hand-written, so the diff engine sees the whole schema as drifted even when nothing real changed.
- **`packages/knowledge-engine/`** — treated as an imported, largely read-only knowledge source. The runtime bridge reads from it; nothing in `app/` or `web/` should write into it.
- **RLS policies** (`current_app_org_id()`, `current_app_can_write()`, forced-RLS tables) — tighten/loosen only with a live RLS integration test proving the new behavior (`app/tests/rls.integration.ts`). Notably: `supplier_price_updates` review (approve/reject) is deliberately restricted to admin/owner even though estimator+ can enqueue — don't loosen it to match without re-checking intent.
- **`supplier_price_updates.supplier_id` / `.material_id` foreign keys** — must stay `ON DELETE RESTRICT`, not `CASCADE` (a prior regression silently destroyed price-update history).
- **Assembly `isTemplate`** — org-scoped by design; do not add a cross-tenant "global" template catalog via `org_id = NULL` (forced RLS would make such rows invisible to every tenant, not shared).
- **Running tenant Prisma queries outside a request/background database session** — RLS depends on transaction-local `app.user_id`/`app.org_id`/`app.role` session vars; a bare query outside `runWithBackgroundDatabaseSession`/the request transaction silently returns zero rows under forced RLS rather than erroring.
- **Secrets** — never ask for or paste a raw database password/connection string into chat. If one appears, treat it as compromised and have it rotated immediately, then use `gh secret set ... < file` or the web UI instead.
- **Other agents' worktrees** (`.claude/worktrees/<other-name>/`) and their branches — read-only if you need context; don't edit or commit into them.
- **Code outside your task's declared scope.** If your task says "docs only" (as this one did: `docs/`, `README.md`, `AGENTS.md`, `claude.md`), don't touch `app/` or `web/` even if you notice something that looks wrong there — note it in your report instead.

## Known Docker limitation

`npm run test:integration` (live RLS verification) and `scripts/deploy-migrations.sh`/`scripts/provision-app-role.sh` (real migration rollout) require:

1. A running **Docker daemon** — they provision a disposable PostgreSQL 16 container (`tradeos-costbook-test`, `127.0.0.1:55432`).
2. A **host `psql` client on `PATH`** — not `docker exec`-based. On macOS via Homebrew, `psql` ships keg-only under `libpq` and is **not symlinked onto `PATH` automatically** (`brew install libpq`, then add `/opt/homebrew/opt/libpq/bin` to `PATH` for the shell).

If Docker isn't available in your environment (many sandboxed/CI agent environments don't have it), you **cannot** run `npm run test:integration` locally. `npm test` (mocked Prisma, unit-only) will still pass, but it does **not** catch RLS violations — mocked tests have historically hidden real bugs here (e.g. the login RLS chicken-and-egg bug found only via live HTTP testing). If you can't run the live suite, say so explicitly rather than claiming full verification; don't silently skip it and report success.

Reused containers carry state across sessions — `docker ps` showing `tradeos-costbook-test` already `Up` is expected; the test/run scripts reuse it unless told to recreate (`--fresh`).

## Verification commands

Backend (`app/`):

```bash
npm test                  # unit tests, mocked Prisma
npm run test:integration  # live RLS verification — needs Docker + psql, see above
npm run lint               # tsc --noEmit
npm run build               # tsc -p tsconfig.json
```

Front-end (`web/`):

```bash
npm run lint
npm run build
```

All must pass before treating a change as verified. Fix code, not tests. For UI changes, prefer driving the real app in a browser (Playwright, or the committed `app/.claude/skills/run-tradeos-costbook-api/` skill) over trusting `npm run build` alone — several real backend bugs in this repo's history were only ever caught by live HTTP/browser testing, never by the unit suite.

## Where to go next

- Sprint status and roadmap: [`docs/CURRENT_SPRINTS.md`](CURRENT_SPRINTS.md), [`docs/NEXT_STEPS.md`](NEXT_STEPS.md)
- Technical dev guide (module pattern, gotchas, key files): [`AGENTS.md`](../AGENTS.md)
- Session-by-session detailed history: [`claude.md`](../claude.md), [`docs/rolling-todo.md`](rolling-todo.md), [`docs/end-of-session-note.md`](end-of-session-note.md)
- System/product architecture: [`docs/SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md), [`docs/PROJECT_LIFECYCLE.md`](PROJECT_LIFECYCLE.md), [`docs/DOCUMENT_WORKFLOW.md`](DOCUMENT_WORKFLOW.md)
- Knowledge Engine: [`docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`](KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md), [`docs/TRAININGLESS_AI_ESTIMATING_DEMO.md`](TRAININGLESS_AI_ESTIMATING_DEMO.md), [`docs/TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md`](TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md)
- Original roadmap: [`docs/frontend-platform-completion-plan.md`](frontend-platform-completion-plan.md)
