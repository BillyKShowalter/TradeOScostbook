# Project Status

_Last audited: 2026-07-03, as part of a full repository audit following the legacy Costbook/Swift/Knowledge-Engine asset migration._

This is the single current-state document. Where other docs in this repo disagree with this one, treat this one (and the audit set it belongs to — `MIGRATION_AUDIT.md`, `EXECUTIVE_REPOSITORY_AUDIT.md`) as authoritative, and treat the other doc as due for an update.

## Backend — `app/` ("tradeos-costbook-api")

**Working.** Node/TypeScript/Express + Prisma/PostgreSQL, with forced row-level security for tenant isolation.

- 17 business-domain modules under `app/modules/`: `cost-database`, `labor-database`, `material-database`, `equipment-database`, `assemblies-database`, `estimate-engine`, `proposal-generator`, `admin-dashboard`, `auth`, `change-orders`, `contracts`, `invoices`, `organization-provisioning`, `project-intake`, `proposals`, `supplier-database`, `supplier-integration`.
- 30 Prisma models, 9 tracked migrations (`app/prisma/migrations/`), latest two (`20260702103000_add_project_intake_foundation`, `20260702120000_add_site_visit_intake_result`) add AI-assisted site-visit intake support.
- Internal directory was renamed `api/` → `backend/` (so it's `app/backend/`, not `app/api/`) — several docs still say `api/`; see `MIGRATION_AUDIT.md`.
- Real email/password auth (backend-issued bearer JWT) plus a platform-provisioning path for first-owner org creation.
- 34 test files (33 unit + 1 live-Postgres RLS integration suite). `npm test`, `npm run lint` (type-check only, no separate linter), and `npm run test:integration` (disposable Docker Postgres) all pass as of the last verified run referenced in `docs/end-of-session-note.md`.
- Schema/role rollout automation (`npm run db:deploy`) is applied against a real Supabase project (confirmed via live Supabase MCP inspection in a prior session — 24+ tables, forced RLS on all of them, `tradeos_app` role provisioned). **The compiled API server itself is not deployed anywhere yet** — `app/vercel.json` is a minimal framework hint, not a linked/deployed Vercel project.
- A GitHub Actions workflow (`.github/workflows/deploy-migrations.yml`) automates migration rollout; verified locally with `act`. Required-reviewer protection on the `production` GitHub Environment could not be enabled (a GitHub billing-plan quirk, unresolved) — `workflow_dispatch` currently runs without a human-approval gate.

## Frontend — `web/`

**Working**, further along than most docs describe. Next.js 16 (App Router), React 19, TanStack Query, shadcn/ui.

- Auth is **Supabase Auth** (`@supabase/ssr`), not the hand-rolled JWT-cookie scheme described in some session notes and (until this audit) in `web/README.md`. See `MIGRATION_AUDIT.md` for the reconciliation.
- Pages: `/`, `/login`, `/signup` (public); `/dashboard`, `/customers` (+ new/[id]), `/projects` (+ new/[id]), `/projects/[id]/estimates/[estimateId]` (Estimate Builder), `/projects/[id]/intake` (AI-assisted site-visit intake), `/projects/[id]/proposals` (+ new/[id]/preview), `/projects/[id]/invoices` (+ new/[id]), `/projects/[id]/contracts/[id]` — all protected by the `(app)/layout.tsx` auth gate.
- Two data-access patterns by design: Server Actions/Components for most CRUD, TanStack Query through a generic same-origin proxy (`/api/proxy/[...path]`) for the interactive Estimate Builder, and a separate binary-safe proxy (`/api/documents/[...path]`) for PDF downloads.
- No `.env.example` exists in `web/` yet (README previously instructed `cp .env.example .env.local`, which would fail — fixed in this audit).
- `src/lib/api.ts` still exports unused `signup()`/`login()` helpers that call the backend's `/api/v1/auth/signup`/`/login` — dead code left over from before the Supabase Auth migration.

## Knowledge Engine — `packages/knowledge-engine/`

**Migrated, not integrated.** ~76MB of legacy costbook data, generation pipelines, prompts, and review tooling, imported wholesale in commit `e31c1c8`. See `docs/KNOWLEDGE_ENGINE_STATUS.md` for the full breakdown.

- Real, usable domain content: ~2,084 priced cost items, assemblies, trade taxonomy, and rule docs under `knowledge/`; Python generation pipelines; prompt templates; a batch review/QA workflow; JSON Schemas.
- **Not wired into `app/` or `web/` in any way** — no code reads from it, and it has no `package.json` (not an npm workspace member).
- The JSON Schemas here and the Prisma schema in `app/prisma/schema.prisma` are structurally different (flat vs. relational) — direct import is not possible; an explicit mapping/ETL layer is required first.
- Contains a large (~66MB, 1,425-directory) generic third-party AI-agent-skills marketplace under `agent-skills/skills/` that is unrelated to the construction/costbook domain — flagged in `docs/TECHNICAL_DEBT.md` for archival.
- Contains a git-tracked npm/npx cache directory (`legacy-archive/scratch/.npm_cache/`, 12 tracked files) that should never have been committed — flagged in `docs/TECHNICAL_DEBT.md`.

## Legacy Swift Reference — `packages/legacy-tradeos-reference/`

**Docs only.** Originally intended to hold the full transfer payload; the payload itself landed at `packages/knowledge-engine/` instead (confirmed byte-identical, so nothing was duplicated). This directory now holds the 5 original transfer-planning docs (`README.md`, `TRANSFER_MANIFEST.md`, `COPY_INSTRUCTIONS.md`, `POST_COPY_CHECKLIST.md`, `INTEGRATION_PLAN.md`) as historical/planning reference. The original SwiftUI costbook editor app itself lives at `packages/knowledge-engine/legacy-archive/archive/legacy-swift-app/`.

## Docs

Several planning docs are stale relative to shipped work — most notably `docs/frontend-platform-completion-plan.md` (still says "no login UI yet" / "no customer-facing UI," both now false) and `docs/AI_ESTIMATING_ARCHITECTURE.md` (designs a knowledge-retrieval system from scratch without apparent awareness that `packages/knowledge-engine/` — imported the same day — already contains a relevant corpus). Full detail in `docs/MIGRATION_AUDIT.md`.

The root session log (`CLAUDE.md`/`claude.md`) is itself behind: it documents work through the Proposal/Invoice/Contract UI, but the repo has since gained the project-intake feature, a full Supabase Auth migration in `web/`, `docs/TradeOS-Engineering-Playbook.md`, `docs/AI_ESTIMATING_ARCHITECTURE.md`, and the knowledge-engine import — none of which are narrated there yet.
