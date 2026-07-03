# Legacy Asset Migration Status

Tracks the migration of legacy Costbook/Swift/Knowledge-Engine assets from `/Users/showb/TradeOS Costbook Editor/TRANSFER_TO_TRADEOS` into this repository, and maps what should happen to each piece next.

## What was migrated, and where it landed

| Source (transfer folder) | Landed at | Commit |
|---|---|---|
| `knowledge/`, `schemas/`, `scripts/`, `runtime/`, `review/`, `exports/`, `prompts/`, `pipelines/`, `docs/`, `agent-skills/`, `legacy-archive/` (the full payload) | `packages/knowledge-engine/` | `e31c1c8` |
| `README.md`, `TRANSFER_MANIFEST.md`, `COPY_INSTRUCTIONS.md`, `POST_COPY_CHECKLIST.md`, `INTEGRATION_PLAN.md` (the transfer-planning docs) | `packages/legacy-tradeos-reference/` | `7491cf7` |

The two landed in **separate directories** rather than one, because a duplicate-copy attempt was caught before it happened: the payload was initially about to be copied into `packages/legacy-tradeos-reference/` too, but a byte-for-byte diff against `packages/knowledge-engine/` showed it was already identical, so only the docs were kept there. **No duplicate payload exists in the repo today** — see `MIGRATION_AUDIT.md` for the verification.

## Package map

### Integrate later (real work required before use)
- `packages/knowledge-engine/knowledge/` — real cost-item/assembly/trade-taxonomy data; needs a schema-mapping/ETL layer (see `KNOWLEDGE_ENGINE_STATUS.md`) before it can feed `app/`'s Prisma-backed database.
- `packages/knowledge-engine/pipelines/export/publish_to_supabase.py` and `sync_manager.py` — an existing Python sync path that could be adapted or ported once the schema mapping exists.
- `packages/knowledge-engine/prompts/` and `runtime/` — prompt templates and an execution-engine design spec directly relevant to the (currently unbuilt) AI-estimating pipeline in `AI_ESTIMATING_ARCHITECTURE.md`.

### Should remain reference-only (valuable, not meant to run in production)
- `packages/knowledge-engine/agent-skills/agents/` — 19 costbook-specific worker-agent definitions; useful as design reference for how the original team automated data generation.
- `packages/knowledge-engine/review/`, `scripts/` — batch QA/lifecycle tooling for curating the knowledge-engine's own data; not application code.
- `packages/knowledge-engine/docs/` — 36 markdown files of architecture/coverage/roadmap notes.
- `packages/knowledge-engine/legacy-archive/archive/legacy-swift-app/` — the original SwiftUI costbook editor; historical reference for anyone porting logic (e.g. its Sync/Validation/Deduplication/Normalization services) into the current Node/Prisma stack.
- `packages/knowledge-engine/legacy-archive/archive/legacy-ui-studio/` — an old static UI prototype.
- `packages/knowledge-engine/legacy-archive/archive/legacy-sync-experiments/` — old sync experiments; keep for history, but see the duplicate-`costbook.json` note in `KNOWLEDGE_ENGINE_STATUS.md`.
- `packages/legacy-tradeos-reference/*.md` — the original transfer-planning docs, kept for historical record of what was planned and how it was verified.

### Should be archived (not costbook-specific, or not meant to be versioned)
- `packages/knowledge-engine/agent-skills/skills/` (~66M, 1,425 directories) — a generic third-party AI-agent-skills marketplace with no relation to construction/costing. Recommend moving out of this package (or removing) rather than leaving it mixed in with real TradeOS knowledge assets. See `TECHNICAL_DEBT.md`.
- `packages/knowledge-engine/legacy-archive/scratch/.npm_cache/` (916K, 12 tracked files) — a raw npm/npx cache, accidentally committed. Recommend untracking (`git rm -r --cached` + `.gitignore` entry), not deleting the repo's history of it. See `TECHNICAL_DEBT.md`.

## What's still pending from the original transfer plan

Per `packages/legacy-tradeos-reference/INTEGRATION_PLAN.md`, integration was always meant to be a separate, later phase from the copy itself. As of this audit:
- Phase 1 (npm workspace setup) — **not started**: no `package.json` at `packages/knowledge-engine/` root (a pointer `README.md` was added in this audit, but that's documentation, not workspace wiring).
- Phase 2 (schema alignment with Prisma) — **not started**: the structural mismatch between `schemas/*.json` and `app/prisma/schema.prisma` is now explicitly documented (`KNOWLEDGE_ENGINE_STATUS.md`) but not resolved.
- Phase 3 (TS service wrapper) — **not started**.
- Phase 4 (sync/seed pipeline) — **not started**, though `pipelines/export/sync_manager.py` is a usable head start once Phase 2 is done.

This is expected, not a gap in execution — the copy and the integration were always scoped as separate pieces of work, and only the copy has happened.
