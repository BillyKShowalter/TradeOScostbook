# Repository Structure

Top-level layout of the TradeOS Costbook repository, as of the 2026-07-03 audit.

```
TradeOScostbook/
├── .github/workflows/
│   └── deploy-migrations.yml       CI/CD: applies app/prisma/migrations + provisions the app DB role
├── README.md                       Repo overview, links into app/, web/, packages/, docs/
├── CLAUDE.md / claude.md           Running session log (same file — see note below)
│
├── app/                            Backend: Express + Prisma + PostgreSQL ("tradeos-costbook-api")
│   ├── backend/                     HTTP layer (routes, controllers, middleware, auth, admin views)
│   │                                 — renamed from `api/`; that name no longer exists on disk
│   ├── db/                          Prisma client singleton + request-scoped transaction routing
│   ├── modules/                     17 business-domain modules (types.ts + service.ts each)
│   ├── prisma/                      schema.prisma (30 models) + migrations/ (9 tracked migrations)
│   ├── scripts/                     Migration rollout, role provisioning, supplier-sync CLI
│   ├── tests/                       34 test files (33 unit, 1 live-Postgres integration)
│   └── .claude/skills/run-tradeos-costbook-api/   Build/run/screenshot automation for this app
│
├── web/                            Frontend: Next.js 16 (App Router), React 19
│   └── src/
│       ├── app/                     Routes: public (/, /login, /signup) + protected (app) group
│       │                            (dashboard, customers, projects, estimates, intake,
│       │                             proposals, invoices, contracts) + api/proxy, api/documents
│       ├── actions/                 Server Actions (auth, customers, projects, proposals, invoices, contracts)
│       ├── components/              shadcn/ui primitives + feature components (projects, proposals, intake)
│       └── lib/                     API clients (server + client), Supabase session helpers
│
├── packages/
│   ├── knowledge-engine/            Legacy costbook knowledge factory (~76MB) — see docs/KNOWLEDGE_ENGINE_STATUS.md
│   │   ├── knowledge/                 Real cost-item/assembly/trade-taxonomy data (~2,084 items)
│   │   ├── schemas/                   JSON Schemas (do not match Prisma models directly)
│   │   ├── pipelines/                 Python generation pipeline + Supabase publish/sync scripts
│   │   ├── prompts/                   LLM prompt templates for generation/runtime agents
│   │   ├── review/                    Batch approval/rejection QA workflow
│   │   ├── runtime/                   Design spec + state for planned "execution engines" (not wired up)
│   │   ├── scripts/                   Batch lifecycle CLI (next/approve/reject/validate)
│   │   ├── docs/                      36 markdown files (architecture, coverage, roadmaps)
│   │   ├── agent-skills/
│   │   │   ├── agents/                 19 costbook-specific worker-agent definitions — keep
│   │   │   └── skills/                 ~1,425 dirs, ~66MB — generic third-party skills marketplace,
│   │   │                               NOT costbook-specific — flagged for archival
│   │   └── legacy-archive/            Original SwiftUI app, old UI prototype, sync experiments,
│   │                                   scratch batch files, and a git-tracked npm cache (flagged)
│   └── legacy-tradeos-reference/    5 transfer-planning docs only (payload landed in knowledge-engine/)
│
└── docs/                            Planning, architecture, and (as of this audit) status/audit docs
    ├── PROJECT_STATUS.md             Current state of every part of the repo
    ├── REPOSITORY_STRUCTURE.md       This file
    ├── SYSTEM_ARCHITECTURE.md        How app/, web/, and packages/knowledge-engine relate
    ├── KNOWLEDGE_ENGINE_STATUS.md    Deep status of packages/knowledge-engine/
    ├── LEGACY_ASSET_MIGRATION_STATUS.md   Package map: integrate later / reference-only / archive
    ├── NEXT_STEPS.md                 Prioritized next engineering tasks
    ├── TECHNICAL_DEBT.md             Risky files and cleanup items found in this audit
    ├── MIGRATION_AUDIT.md            Staleness findings and duplicate-migration check
    ├── EXECUTIVE_REPOSITORY_AUDIT.md Executive summary of this audit
    ├── AI_ESTIMATING_ARCHITECTURE.md  Forward-looking AI pipeline design (Photos→...→Closeout)
    ├── TradeOS-Engineering-Playbook.md  Process/roles doc
    ├── frontend-platform-completion-plan.md  Front-end/CRM/AI roadmap (partially stale — see MIGRATION_AUDIT.md)
    ├── tradeos-mvp-foundation-plan.md  Original foundational MVP plan
    ├── rolling-todo.md / end-of-session-note.md / compressed-session-handoff.md   Running session logs
    ├── design/                       Admin-shell concept + desktop/mobile screenshots (PNGs)
    └── TradeOS-CostBook-Architecture.docx, TradeOS-CostBook-Wireframe-Module-Spec.docx  Original planning docs
```

## Notes

- **`CLAUDE.md` and `claude.md` are the same file**, not duplicates — confirmed same inode. macOS's default case-insensitive filesystem just shows it twice in a case-sensitive listing. Git tracks the lowercase path.
- **`app/` is not `backend/`** at the repo root — `backend/` is a subdirectory *inside* `app/` (`app/backend/`), the renamed former `app/api/`. There is no top-level `backend/` directory.
- **Two `docs/` directories exist**: the repo-root `docs/` (this file's home) and `packages/knowledge-engine/docs/` (the knowledge engine's own internal documentation, 36 files). They are unrelated; don't confuse one for the other when searching.
