# Knowledge Engine Status

Deep status of `packages/knowledge-engine/`, imported wholesale in commit `e31c1c8` ("chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines"). ~76MB total. See `packages/knowledge-engine/README.md` for a shorter pointer version and `packages/knowledge-engine/docs/README.md` for the original self-description.

## What it is

A local, offline "knowledge factory" for construction costing data — not part of the running TradeOS application. It generates, validates, and curates cost-item and assembly data via LLM-agent pipelines, then exports it (`exports/json/costbook.json`, `exports/sql/sync_final.sql`) for eventual loading into the product database. It is not currently wired to do so.

## Directory-by-directory status

| Directory | Size | What's in it | Recommendation |
|---|---|---|---|
| `knowledge/` | 956K | Real domain data: ~2,084 priced cost items (`knowledge/knowledge/cost-items/costbook.json`), trade-specific batches, assemblies referencing cost-item UUIDs, and short rule docs (pricing-sanity, validation-rules, deduplication, normalization-rules, reasoning, trade-taxonomy, retrieval) | **Keep** — this is the actual asset worth integrating eventually |
| `schemas/` | 36K | 9 JSON Schemas: cost-item, assembly, crew, inspection, permit, production-rate, proposal-language, reasoning, supplier | **Keep as reference.** Structurally incompatible with `app/prisma/schema.prisma` — flat cost fields vs. Prisma's relational FKs. Needs an explicit mapping layer, not a direct import |
| `pipelines/` | 2.5M | `master_pipeline.py` (19-agent, 17-trade generation orchestrator), per-trade seed agents, `export/publish_to_supabase.py` and `sync_manager.py` (an already-built `RelationalSynchronizer`) | **Keep** — the Supabase sync scripts are a real head start on the "wire it up" phase |
| `prompts/` | 60K | Agent prompts (CostbookArchitect, AssemblyBuilder, Deduplication, Normalization, PricingSanity, TradeTaxonomy, LegacyImporter, KnowledgeOperationsManager) and runtime prompts (assembly-selector, cost-item-selector, crew-recommender, material-recommender, proposal-reasoner, scope-parser, trade-classifier) | **Keep** — directly relevant to the AI-estimating pipeline design in `AI_ESTIMATING_ARCHITECTURE.md` |
| `review/` | 88K | Batch approval/rejection QA workflow (`pending/`, `rejected/`, `knowledge-quality/`, `knowledge-history/`) | **Keep as reference** |
| `runtime/` | 304K | Design spec for 10 planned "execution engines" (trade-classifier, scope-parser, assembly-matcher, cost-item-matcher, reasoning-engine, proposal-engine, estimate-engine, pricing-engine, validation-engine, confidence-engine) plus JSON state files for offline runs | **Keep as reference** — reads as a spec, not wired-up code |
| `scripts/` | 124K | Batch lifecycle CLI: next/approve/reject/validate for both cost items and assemblies, plus a task-queue state machine (`run-next-task.py`/`complete-task.py`/`fail-task.py`) and an orchestrator SOP | **Keep** — reusable tooling for continuing to curate this data |
| `docs/` | 320K | 36 markdown files: architecture, coverage dashboards/reports, and **four separate roadmap files** (`master-roadmap.md`, `knowledge-roadmap.md`, `runtime-roadmap.md`, `roadmap.md`) | **Keep**, but consolidate the four roadmaps in a future pass — not attempted in this audit since it needs a domain-expert call on which is authoritative |
| `agent-skills/agents/` | (part of 66M below) | 19 costbook-specific worker-agent definitions (CostbookArchitect, AssemblyArchitect, MaterialArchitect, ValidationAgent, DeduplicationAgent, etc.) referencing this package's own prompts/schemas | **Keep** — genuinely TradeOS-specific |
| `agent-skills/skills/` | **66M**, 1,425 subdirectories | A generic, third-party Claude-skills marketplace dump — names include `active-directory-attacks`, `astropy`, `asana-automation`, `seo-technical` (one sampled `SKILL.md` cites `source: https://github.com/AgriciDaniel/claude-seo`), plus stray unrelated binaries (photos, an mp3, benchmark JSON) under `skills/last30days/` and `skills/loki-mode/`. **Zero skill names relate to construction/costing.** | **Not TradeOS-specific — recommend archiving/removing.** This is ~90% of the whole package's footprint and appears to have been swept in accidentally alongside the real transfer. See `TECHNICAL_DEBT.md` |
| `legacy-archive/archive/legacy-swift-app/` | (part of 4.4M) | The original SwiftUI costbook editor app (Views/ViewModels/Services, including Sync/Validation/Deduplication/Normalization services) | **Keep** — real product history |
| `legacy-archive/archive/legacy-ui-studio/` | (part of 4.4M) | A small static HTML/JS/CSS prototype UI | **Keep as reference** |
| `legacy-archive/archive/legacy-sync-experiments/` | 2.5M | Old sync experiment data/scripts, including several superseded `costbook.json` copies | **Keep as reference**, but see duplication note below |
| `legacy-archive/scratch/.npm_cache/` | 916K, 12 git-tracked files | A raw npm/npx cache directory (`_cacache/`, `_npx/`) | **Should never have been committed.** See `TECHNICAL_DEBT.md` — flagged, not removed, in this audit |

## Integration status: not started, and correctly so per its own plan

`packages/legacy-tradeos-reference/INTEGRATION_PLAN.md` scopes integration as four phases: (1) npm-workspace setup, (2) schema alignment with Prisma, (3) a TypeScript service wrapper, (4) a sync/seed pipeline. **None have started.** Phase 1 alone is unmet — there's no `package.json` at `packages/knowledge-engine/` root, so it can't yet function as a workspace member alongside `app/` and `web/`. This is expected at this stage, not a bug — the transfer docs frame integration as deliberately deferred.

## Data duplication inside the package (distinct from the earlier whole-package duplication check — see `MIGRATION_AUDIT.md`)

The same `costbook.json` content exists in at least 7 places at different generations/sizes, with no single one marked authoritative:
- `exports/json/costbook.json` (696K)
- `knowledge/knowledge/cost-items/costbook.json` (696K) — **likely the authoritative one**, referenced by `docs/README.md`'s own description of the package
- `pipelines/exports/json/costbook.json` (556K)
- `pipelines/knowledge/cost-items/costbook.json` (556K)
- `legacy-archive/archive/legacy-sync-experiments/Data/{working,export}/costbook.json` (1.2M / 552K)
- `legacy-archive/archive/legacy-sync-experiments/tools_Data/{working,export}/costbook.json` (344K each)

Recommend picking `knowledge/knowledge/cost-items/costbook.json` as authoritative and either removing or clearly labeling the rest as historical snapshots in a future pass (not done here, per this audit's "do not delete" scope).
