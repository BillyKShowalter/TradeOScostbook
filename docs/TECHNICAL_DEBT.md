# Technical Debt

Findings from the 2026-07-03 repository audit. Nothing listed here has been deleted — see each item's recommendation for the suggested (not yet executed, unless noted) cleanup action.

## High priority

### 1. Git-tracked npm/npx cache
`packages/knowledge-engine/legacy-archive/scratch/.npm_cache/` contains 12 git-tracked files (`_cacache/`, `_npx/` subdirectories, ~916K) — a raw package-manager cache that should never have been committed. Not gitignored anywhere in the repo.
**Recommendation:** `git rm -r --cached packages/knowledge-engine/legacy-archive/scratch/.npm_cache` and add the path to `.gitignore`. Not executed in this audit (scope was documentation, not repo surgery) — flagged here for a deliberate follow-up commit.

### 2. Generic third-party skills marketplace mixed into product knowledge assets
`packages/knowledge-engine/agent-skills/skills/` is ~66M across 1,425 directories and is a generic Claude-skills marketplace dump (security, marketing, devops, and unrelated domain skills — one sampled `SKILL.md` cites an external GitHub source, `date_added: 2026-03-21`). It contains stray unrelated binaries (photos, an mp3, benchmark JSON) under `skills/last30days/` and `skills/loki-mode/`. Zero skill names relate to construction/costing. This is ~90% of the entire knowledge-engine package's size and appears to have been swept in accidentally alongside the real transfer.
**Recommendation:** Move it out of `packages/knowledge-engine/` (e.g. to its own `packages/_archive/third-party-agent-skills/` or remove it from this repo entirely if it's available elsewhere). Keep `agent-skills/agents/` (the 19 costbook-specific worker-agent definitions), which is genuinely product-relevant and much smaller.

### 3. Prisma/Knowledge-Engine schema mismatch
`packages/knowledge-engine/schemas/*.json` describe cost items/assemblies with a flat shape (combined `laborCost`/`materialCost`/`equipmentCost` fields, no relational IDs). `app/prisma/schema.prisma`'s `CostItem`/`Assembly` models are fully relational (separate FK rows for labor rate/material/equipment/subcontractor, org-scoped, `isTemplate` flag). **These are not drop-in compatible.** Any future work to load knowledge-engine data into the live database needs an explicit mapping/ETL layer, not a direct import script.
**Recommendation:** Scope this as its own engineering task before attempting any knowledge-engine → `app/` data load. See `NEXT_STEPS.md`.

## Medium priority

### 4. Redundant `costbook.json` copies with no single authoritative source
The same cost-item data exists in at least 7 locations inside `packages/knowledge-engine/` at different generations/sizes (696K down to 344K) — see `KNOWLEDGE_ENGINE_STATUS.md` for the full list. No file is marked authoritative; a future importer could easily pick a stale copy by accident.
**Recommendation:** Designate `knowledge/knowledge/cost-items/costbook.json` as authoritative (it matches the count `docs/README.md` describes) and label or remove the rest in a follow-up pass.

### 5. Session log (`CLAUDE.md`/`claude.md`) has fallen behind real repo state
The project's own running session log documents work only through the Proposal/Invoice/Contract UI. Several real, committed pieces of work are absent from its narrative: the project-intake feature (site-visit classification/confidence scoring, 3 commits), `docs/TradeOS-Engineering-Playbook.md`, `docs/AI_ESTIMATING_ARCHITECTURE.md`, the knowledge-engine import itself, and — most significantly — a full migration of `web/`'s auth model from a hand-rolled JWT cookie to Supabase Auth. Given the project's own stated rule ("Update this file after every meaningful implementation block"), this is a process gap, not just a documentation nit: future sessions reading this file for context will get a materially incomplete picture.
**Recommendation:** Append a dated entry to `CLAUDE.md` covering the gap (this audit adds one — see the end of the file). Going forward, treat the Supabase Auth migration in particular as something that should have had its own entry.

### 6. Four separate roadmap files in `packages/knowledge-engine/docs/`
`master-roadmap.md`, `knowledge-roadmap.md`, `runtime-roadmap.md`, and `roadmap.md` likely overlap; it's unclear which is authoritative.
**Recommendation:** Consolidate in a future pass with input from whoever wrote them — not attempted here, since collapsing roadmap content without domain context risks losing real planning decisions.

### 7. Dead auth helpers in `web/src/lib/api.ts`
`signup()`/`login()` helpers that call the backend's `/api/v1/auth/signup`/`/login` routes remain exported but are unused — the current `signupAction`/`loginAction` Server Actions call Supabase directly (and, for signup, the backend's `/api/v1/auth/bootstrap` instead).
**Recommendation:** Either remove the dead helpers or wire them up deliberately if there's a reason to keep a non-Supabase auth path available.

## Low priority / cosmetic

### 8. Stray Python bytecode cache
`packages/knowledge-engine/pipelines/export/__pycache__/sync_manager.cpython-314.pyc` (8K) is committed. Trivial size, same category as finding #1.
**Recommendation:** Remove from tracking, add `__pycache__/` to `.gitignore` if not already covered.

### 9. `app/README.md` and the `run-tradeos-costbook-api` skill had drifted from the `api/` → `backend/` rename
Fixed in this audit (see `MIGRATION_AUDIT.md` for the full list of corrected references). Listed here only so it isn't re-introduced: watch for new docs or scripts written against `api/...` paths, since the directory no longer exists.

### 10. No `.env.example` in `web/`
`web/README.md` previously instructed `cp .env.example .env.local`, but no such file exists. Fixed in this audit by removing the incorrect instruction; a real `.env.example` still doesn't exist.
**Recommendation:** Add one listing `BACKEND_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`, `SUPABASE_STORAGE_BUCKET_PUBLIC`.
