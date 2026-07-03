# Executive Repository Audit

**Date:** 2026-07-03
**Scope:** Full repository audit following the migration of legacy Costbook/Swift/Knowledge-Engine assets into `packages/knowledge-engine/` and `packages/legacy-tradeos-reference/`. No product features added, no business logic changed except broken-reference fixes in documentation. Nothing was deleted.

## What's working

- **Backend (`app/`)** — Express + Prisma/PostgreSQL API with forced row-level-security multi-tenancy, 17 business modules, 30 Prisma models, 9 tracked migrations, 34 test files (unit + live-Postgres integration), all passing as of the last verified run. Real bearer-JWT auth, organization membership enforcement, and platform-level org provisioning. Schema and role are live on a real Supabase project.
- **Frontend (`web/`)** — Next.js 16 covering auth (Supabase), customer/project CRM, a working Estimate Builder, Proposal/Invoice/Contract workflows with PDF generation, and an AI-assisted site-visit intake page. Further along than most existing docs described it.
- **CI/CD** — A GitHub Actions workflow applies migrations and provisions the database role automatically, verified with `act` against a real disposable database.
- **Knowledge-engine data itself** — ~2,084 real, priced cost items plus assemblies, trade taxonomy, and a working generation/review pipeline. Genuinely valuable, well-organized legacy content.

## What's migrated

- The full legacy knowledge-engine payload (data, schemas, pipelines, prompts, review workflow, runtime spec, scripts, docs, agent definitions, and archived legacy apps) landed intact at `packages/knowledge-engine/`.
- The original SwiftUI costbook editor app is preserved at `packages/knowledge-engine/legacy-archive/archive/legacy-swift-app/`.
- The transfer-planning docs are preserved separately at `packages/legacy-tradeos-reference/`, with a status note added clarifying where the actual payload lives.
- **Verified: no duplicate migration occurred.** A second full copy was caught and stopped before being committed (confirmed byte-identical via diff); only the docs, not the payload, ended up in two places.

## What's not integrated

- `packages/knowledge-engine/` has no `package.json` and is not an npm workspace member — it is currently inert reference data, not connected to `app/` or `web/` in any way.
- Its JSON Schemas are structurally incompatible with `app/prisma/schema.prisma` (flat vs. relational shape) — a real mapping/ETL layer is required before any of this data can reach the live database.
- `AI_ESTIMATING_ARCHITECTURE.md`, written the same day as the knowledge-engine import, doesn't yet account for the retrieval/reasoning/prompt content that landed alongside it — the two need to be reconciled by someone with domain context, not mechanically merged.

## What's blocked

- **CI approval gate**: required-reviewer protection on the `production` GitHub Environment won't enable despite a GitHub Pro upgrade — a billing-plan quirk that leaves `workflow_dispatch` migration runs without a human-approval checkpoint. Unresolved as of this audit.
- **Production API deployment**: the database is live on Supabase, but the compiled API server has no deployed home yet.
- **Live supplier price feed**: the queue/review/audit/worker/scheduler plumbing is complete and tested, but the actual feed fetcher is a stub with no real supplier API to call.

## Documentation state

Found and fixed in this audit:
- `app/README.md` and the `run-tradeos-costbook-api` skill both had stale `api/`-path references from before the `api/` → `backend/` rename, an undercounted module list, and hardcoded test/migration counts. All corrected.
- `web/README.md` described a hand-rolled JWT-cookie auth model; the app actually uses Supabase Auth. Rewritten to match reality, including a note about now-dead legacy auth-helper code. A broken `.env.example` setup instruction was also fixed.
- `packages/legacy-tradeos-reference/README.md` referred to itself as containing the payload that actually lives in the sibling `packages/knowledge-engine/` — added a clarifying status banner.
- Root `README.md` didn't mention `packages/` at all — added, along with pointers to this audit's new docs.
- `packages/knowledge-engine/` had no root-level README — added one with a directory map and integration status.

Left alone deliberately: `docs/end-of-session-note.md`, `docs/compressed-session-handoff.md`, `docs/rolling-todo.md`, and `CLAUDE.md`/`claude.md` are chronological session logs. Editing their historical entries to match current terminology would misrepresent what was true when they were written. `CLAUDE.md` got a new dated entry instead of a rewrite, consistent with its own "append after every block" convention. `docs/frontend-platform-completion-plan.md` (says "no login UI yet," now false) and `docs/AI_ESTIMATING_ARCHITECTURE.md` (unaware of the knowledge-engine import) were flagged but not rewritten — both need a maintainer decision, not a mechanical correction. Full detail in `MIGRATION_AUDIT.md`.

## Duplicate/migration risks found

1. No duplicate knowledge-engine payload in the repo (verified).
2. A git-tracked npm/npx cache directory (`packages/knowledge-engine/legacy-archive/scratch/.npm_cache/`, 12 files, ~916K) — should never have been committed.
3. A generic third-party AI-agent-skills marketplace (~66M, 1,425 directories, zero construction-domain relevance) sitting inside `packages/knowledge-engine/agent-skills/skills/` — appears to have been swept in accidentally alongside the real transfer.
4. Seven redundant copies of `costbook.json` at different generations inside `packages/knowledge-engine/`, with no single one marked authoritative.

None of these were deleted in this audit (by design — see `TECHNICAL_DEBT.md` for the full list and recommended, not-yet-executed, remediation).

## Current architecture, in one paragraph

A Next.js 16 frontend (`web/`) using Supabase Auth talks to an Express/Prisma backend (`app/`) over a bearer-JWT REST API; the backend enforces multi-tenant isolation via forced PostgreSQL row-level security and is schema-migrated onto a live Supabase project, though not yet deployed as a running service anywhere. A separate, offline "knowledge factory" (`packages/knowledge-engine/`) holds real costing data and Python/prompt-driven generation pipelines, but has no runtime connection to either `app/` or `web/` yet — it's reference material and future data, not live infrastructure.

## Recommended next sprint

1. Reconcile `AI_ESTIMATING_ARCHITECTURE.md` with the now-present knowledge-engine corpus (highest leverage — avoids rebuilding retrieval/reasoning work that may already exist).
2. Clean up `packages/knowledge-engine/` size/risk items: archive the third-party skills marketplace, untrack the npm cache, deduplicate `costbook.json` copies.
3. Scope (design doc, not code) the knowledge-engine → Prisma schema mapping.
4. Update `docs/frontend-platform-completion-plan.md`'s status banner to reflect shipped Phases 0–1.
5. Deploy the API server to a real target and resolve the CI required-reviewer gate.

Full detail on each in `docs/NEXT_STEPS.md`.

## Suggested Git commit message

```
docs: full repository audit post-migration — status, architecture, and cleanup docs

Adds PROJECT_STATUS, REPOSITORY_STRUCTURE, SYSTEM_ARCHITECTURE,
KNOWLEDGE_ENGINE_STATUS, LEGACY_ASSET_MIGRATION_STATUS, NEXT_STEPS,
TECHNICAL_DEBT, MIGRATION_AUDIT, and EXECUTIVE_REPOSITORY_AUDIT under
docs/. Fixes stale api/->backend/ path references and module/test
counts in app/README.md and the run-tradeos-costbook-api skill,
corrects web/README.md's auth-model description to match the actual
Supabase Auth implementation, clarifies packages/legacy-tradeos-reference/
README's relationship to packages/knowledge-engine/, and adds a root
README.md pointer to packages/ and the new audit docs. No product
code, business logic, or data files changed; nothing deleted.
```

## Files reviewed / created / modified

- **Files reviewed:** ~40 documentation/config files read directly by this audit or its four research subagents, across `app/` (README, package.json, .env.example, SKILL.md, module/migration/test listings), `web/` (README, routes, auth/session/proxy code, api client code), `packages/knowledge-engine/` (all 11 top-level subdirectories, sampled representatively given ~76M size), `packages/legacy-tradeos-reference/` (all 5 docs), and `docs/` (all 8 pre-existing markdown files plus `design/`).
- **Files created (10):** `docs/PROJECT_STATUS.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/KNOWLEDGE_ENGINE_STATUS.md`, `docs/LEGACY_ASSET_MIGRATION_STATUS.md`, `docs/NEXT_STEPS.md`, `docs/TECHNICAL_DEBT.md`, `docs/MIGRATION_AUDIT.md`, `docs/EXECUTIVE_REPOSITORY_AUDIT.md` (this file), `packages/knowledge-engine/README.md`.
- **Files modified (5):** `README.md` (root), `app/README.md`, `app/.claude/skills/run-tradeos-costbook-api/SKILL.md`, `web/README.md`, `packages/legacy-tradeos-reference/README.md`, plus a new dated entry appended to `CLAUDE.md`/`claude.md`.
- **Stale docs updated:** see the Documentation state section above and the full table in `docs/MIGRATION_AUDIT.md`.
- **Duplicate/migration risks found:** see above and `docs/TECHNICAL_DEBT.md`.
