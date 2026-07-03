# TradeOS Construction Knowledge Engine

This is the entry point for `packages/knowledge-engine/`. The full write-up lives in [`docs/README.md`](docs/README.md); this file is a short pointer plus current-integration status, since none existed at this directory's root before this audit.

## What this is

A local, file-based repository of construction costing data, generation pipelines, prompts, and review workflows — the "knowledge factory" that produces cost-item/assembly data, not the TradeOS product itself. See [`docs/README.md`](docs/README.md) for the full explanation of what it is and how AI systems are meant to consume it.

## Current integration status

**Not yet wired into `app/` or `web/`.** This package is currently inert reference data and tooling — no code in `app/` or `web/` reads from it, and it has no `package.json` (so it isn't an npm workspace member yet). See [`docs/KNOWLEDGE_ENGINE_STATUS.md`](../../docs/KNOWLEDGE_ENGINE_STATUS.md) at the repo root for the full current-state audit, and [`packages/legacy-tradeos-reference/INTEGRATION_PLAN.md`](../legacy-tradeos-reference/INTEGRATION_PLAN.md) for the originally-planned integration phases (schema alignment with Prisma, a TS service wrapper, a sync/seed pipeline — none of which have started).

## Directory map

| Directory | Contents | Status |
|---|---|---|
| `knowledge/` | Real cost-item/assembly/trade-taxonomy JSON data (~2,084 cost items) plus rule docs (pricing-sanity, validation, dedup, normalization, reasoning, retrieval) | Keep — genuine domain data |
| `schemas/` | JSON Schemas for cost-item/assembly/crew/inspection/permit/etc. | Keep as reference — does **not** structurally match `app/prisma/schema.prisma`'s relational models; needs an explicit mapping layer before use |
| `pipelines/` | Python generation pipeline (`master_pipeline.py`, per-trade seed agents) and a Supabase publish/sync script | Keep as reference |
| `prompts/` | LLM prompt templates for the generation/runtime agents | Keep as reference |
| `review/` | Batch approval/rejection QA workflow | Keep as reference |
| `runtime/` | Design spec + state files for a set of "real-time execution engines" (trade-classifier, scope-parser, estimate-engine, etc.) — not wired up yet | Keep as reference |
| `scripts/` | Batch lifecycle scripts (next/approve/reject/validate for cost items and assemblies) | Keep as reference |
| `docs/` | 36 markdown files: architecture, coverage reports, roadmaps, how-to-run-automation | Keep — see consolidation note below |
| `agent-skills/agents/` | 19 costbook-specific worker-agent definitions (CostbookArchitect, AssemblyArchitect, etc.) | Keep — TradeOS-specific |
| `agent-skills/skills/` | ~1,425 subdirectories, ~66M | **Not TradeOS-specific** — a generic third-party AI-skills marketplace dump (security/marketing/devops skills unrelated to construction). Recommended for archival/removal — see `docs/TECHNICAL_DEBT.md` |
| `legacy-archive/` | Original SwiftUI costbook editor app, an old static UI prototype, sync experiments, and scratch batch files (including a git-tracked `.npm_cache/` that shouldn't be versioned) | Keep the app/UI history; flag the npm cache — see `docs/TECHNICAL_DEBT.md` |

`docs/` has four separate roadmap files (`master-roadmap.md`, `knowledge-roadmap.md`, `runtime-roadmap.md`, `roadmap.md`) that likely overlap and are worth consolidating in a future pass — not done in this audit to avoid losing content without a domain-expert review of which is authoritative.
