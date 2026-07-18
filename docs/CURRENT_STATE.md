---
status: current
owner: platform
last_verified: 2026-07-18
source_of_truth: true
related_code:
  - app/backend/server.ts
  - app/domain/contracts.ts
  - app/prisma/schema.prisma
  - app/prisma/migrations/
  - app/backend/routes/
  - app/modules/
  - web/src/app/
  - web/src/components/
  - .github/workflows/verify-repository.yml
  - .github/workflows/docs-consistency.yml
---

# Current State

Last verified against `origin/main` commit `ac72ff235db687d9cb8619820e536aec040afc6b` on 2026-07-18.

TradeOS is in RC1 hardening. The merged TradeOS Bible is canonical doctrine, but this file is the factual implementation ledger. Do not present Bible goals, research findings, or sprint intent as shipped software unless there is merged repository evidence.

Status vocabulary:

- `LIVE`: implemented and wired into the active app or operational workflow on `main`.
- `IMPLEMENTED`: code or documentation exists on `main`, but live deployment, full UI wiring, or production operation is not proven here.
- `PARTIAL`: meaningful shipped pieces exist, with known missing integration, hardening, or workflow coverage.
- `PLANNED`: documented intent exists, but implementation is not present on `main`.
- `BLOCKED`: work cannot safely proceed without a named external decision, access, or dependency.
- `UNKNOWN`: repository evidence is insufficient; do not guess.

## Implementation Ledger

| System | Status | Evidence | Current limitation or unresolved truth |
| --- | --- | --- | --- |
| Bible and documentation system | LIVE | PR #31 merged as `ac72ff2`; PR #32 merged into the Bible branch; `docs/TRADEOS_BIBLE.md`, `docs/bible/`, `docs/SPRINT_BACKLOG.md`, `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`, `scripts/docs-check.mjs`; `npm run docs:test` and `npm run docs:check -- --base origin/main` are the required local docs checks. | First-party operational docs were stale immediately after the Bible merge; this branch repairs that post-merge truth. |
| Repository verification | IMPLEMENTED | `.github/workflows/verify-repository.yml` runs app lint, unit tests, build, integration tests, and web lint/build; `.github/workflows/docs-consistency.yml` enforces doc ownership; root `package.json` defines `docs:test` and `docs:check`. | Exact required checks, branch rulesets, review settings, and environment approvals remain GitHub/external state and must be verified live before claiming they are configured. |
| Database and migrations | IMPLEMENTED | `app/prisma/schema.prisma`; `app/prisma/migrations/`; `app/scripts/deploy-migrations.sh`; `app/scripts/test-integration-db.sh`; PR #23 repaired seed workflow; PR #7 added `pg_trgm` name-search indexes. | Production deployment state, backup/restore evidence, and environment approvals are unknown from repository files alone. Mixed name-or-code search still has a known scan-risk gap for code substring matching. |
| Authentication and tenancy | LIVE | `app/backend/middleware/auth.ts`; `app/backend/middleware/databaseSession.ts`; `app/db/requestSession.ts`; `app/modules/auth/service.ts`; `app/modules/organization-provisioning/service.ts`; PR #26 removed header-based tenant impersonation bypass; module doc `docs/modules/auth-and-tenancy.md`. | Hosted login readiness and usable demo credentials are not proven by repository evidence. |
| Forced RLS model | LIVE | Request-scoped database session sets `app.user_id`, `app.org_id`, `app.role`, and `app.session_source`; RLS integration harness lives at `app/tests/rls.integration.ts`; backend README documents `npm run test:integration`. | Live integration requires Docker, `psql`, and local database harness availability. Passing CI is separate from local availability. |
| Costbook | LIVE | Modules under `app/modules/cost-database`, `labor-database`, `material-database`, `equipment-database`, `assemblies-database`; routes under `app/backend/routes/*Database.routes.ts`; docs `docs/modules/cost-book.md`; PR #7 name-search indexes. | Live supplier feed ingestion is not implemented. Code-substring search performance remains a planned hardening gap. |
| AI Estimator Engine | PARTIAL | PR #29 merged as `10ec35e`; backend routes `app/backend/routes/aiEstimateAssist.routes.ts`; structured service `app/modules/ai-estimate-assist/structuredEstimator.ts`; docs `docs/modules/ai-estimate-assist.md`; endpoints `POST /api/v1/estimates/:id/ai-estimator/draft` and `/apply`. | Backend structured estimator is implemented and review-first, but the active web assist component still uses legacy `/ai-suggestions` endpoints. It does not autonomously write lines and does not call external model APIs. |
| AI Estimate Assist legacy suggestions | LIVE | `app/modules/ai-estimate-assist/service.ts`; `web/src/components/estimate-assist/ai-estimate-assist.tsx`; docs `docs/modules/ai-estimate-assist.md`; PR #18 integrated AI assist and knowledge runtime. | Structured estimator draft/apply is newer backend capability and is not fully the frontend contract yet. |
| Knowledge Runtime | IMPLEMENTED | PR #18 integrated the app runtime; `app/modules/knowledge-runtime/`; routes `app/backend/routes/knowledgeRuntime.routes.ts`; module README states read-only behavior. | `packages/knowledge-engine/**` internals were intentionally not inspected during this repair because PR #33/#34 own that scope. App-managed import/versioning remains future work. |
| Founder Preview | PARTIAL | PR #27 merged contractor UX research and Founder Preview spec; PR #28 merged dashboard Needs Attention workflow; `docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md`; `web/src/components/dashboard/needs-attention-card.tsx`. | Larger command center, onboarding/import, weather, voice, and technician-specific preview items are documented as future or out-of-scope in the spec. Hosted preview and login credentials are unknown. |
| Contractor UX research | IMPLEMENTED | PR #27 merged; `docs/research/CONTRACTOR_UX_RESEARCH.md`; `docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md`. | Research is supporting evidence, not implementation truth. Product claims still need repository or live-product evidence before being marked `LIVE`. |
| Dispatcher workspace | PARTIAL | Jobs backend from PR #20; routes in `app/backend/routes/jobs.routes.ts`; service in `app/modules/jobs/service.ts`; docs `docs/modules/jobs-and-scheduling.md`; project workspace summary in `web/src/components/projects/project-workspace.tsx`. | Core scheduling/dispatch backend exists; richer dispatcher board UX and end-to-end dispatcher verification remain planned. |
| Scheduling and dispatch | IMPLEMENTED | PR #20 merged job scheduling engine and document lifecycle history; `Job`, assignment, scheduling, rescheduling, field-status, and ready-to-invoice flows are represented in app modules and routes. | Lifecycle normalization and conflict-rule hardening remain planned before RC smoke confidence. |
| Mobile and field experience | PARTIAL | Job status workflows exist in `app/modules/jobs/service.ts`; field-status route group exists in `app/backend/routes/jobs.routes.ts`; responsive app surfaces exist in `web/src/app`. | Technician daily workflow and mobile-specific hardening are planned in S032; no dedicated mobile app exists. |
| Brand Studio | PARTIAL | Brand Studio backend module and routes exist under `app/modules/brand-studio` and `app/backend/routes/brandStudio.routes.ts`; web route exists at `web/src/app/(app)/brand-studio/page.tsx`; docs `docs/modules/brand-studio.md`. | PR #30 is open for Settings asset persistence. Document rendering integration still uses separate proposal/contract/invoice PDF paths rather than one fully unified branded renderer. |
| Settings Console asset upload | PARTIAL | `web/src/components/settings/settings-console.tsx` handles asset selection; PR #30 open on `fix/brand-studio-asset-upload-persistence` adds durable storage handling. | Do not mark complete until PR #30 merges. Product ownership between Settings branding and Brand Studio still needs S014 founder/ADR decision. |
| Settings and organization operations | LIVE | `app/modules/settings`; `app/modules/admin-dashboard`; `app/backend/routes/settings.routes.ts`; web settings route; docs `docs/modules/settings-and-operations.md`. | Brand source-of-truth convergence is unresolved. |
| Customer portal | PARTIAL | Portal routes and document views exist in `web/src/app/(app)/portal`; docs `docs/modules/customer-portal.md`; proposal/contract/invoice modules generate customer-facing documents. | Portal authentication hardening and proposal/contract/invoice portal flows remain planned RC work. |
| Projects and project workspace | LIVE | `app/modules/project-intake`, `project-tasks`, `crm`, and `jobs`; project routes; `web/src/app/(app)/projects`; docs `docs/modules/projects.md`. | Lifecycle compatibility values still need normalization across storage, APIs, UI, and portal. |
| Proposals, contracts, invoices, and change orders | LIVE | Modules under `app/modules/proposals`, `contracts`, `invoices`, `change-orders`; PDF renderers; web document screens; docs modules. | Lifecycle compatibility cleanup and document rendering reliability remain planned. Public payment processing is not implemented. |
| Payments or billing | PARTIAL | Invoice payment recording exists in app modules and docs `docs/modules/invoices-and-payments.md`. | Public payment processing, external billing rails, accounting sync, and subscription billing are not implemented. |
| Integrations | PARTIAL | Supplier database and supplier integration queue/review/audit/scheduler plumbing exist in `app/modules/supplier-database` and `app/modules/supplier-integration`. | `SupplierIntegrationService` feed fetcher is a stub returning no quotes; live feed ingestion, accounting, payroll, and payment integrations are not implemented. |
| Product deployment | UNKNOWN | `docs/DEPLOYMENT_GUIDE.md`; `.github/workflows/deploy-migrations.yml`. | Hosted deployment status, production topology, domain state, environment approvals, backup evidence, and live smoke results require external verification. |

## Open Pull Requests

Verified on 2026-07-18:

- PR #30, `fix/brand-studio-asset-upload-persistence`: open Brand Studio/Settings web work. Do not modify, review, rebase, or merge in this branch.
- PR #33, `docs/knowledge-engine-phase-a-guardrails`: open Claude-owned knowledge-engine guardrail work. It touches `docs/DOC_OWNERSHIP.yml`, `docs/ENGINEERING_COMMAND_CENTER.md`, `docs/README.md`, `docs/REPOSITORY_GOVERNANCE.md`, and `packages/knowledge-engine/**`.
- PR #34, `fix/knowledge-engine-canonical-paths`: open Claude-owned knowledge-engine canonical-path work stacked on PR #33. It touches `packages/knowledge-engine/**`.

## Recent Merged Evidence

- PR #31: TradeOS Bible and 50-sprint execution system merged as `ac72ff235db687d9cb8619820e536aec040afc6b`.
- PR #32: Bible Volume 3 engineering doctrine expansion merged into the foundation branch.
- PR #29: AI Estimator engine hardening merged as `10ec35e`.
- PR #28: Founder Preview Needs Attention workflow merged as `f032808`.
- PR #27: contractor UX research and Founder Preview experience spec merged as `279bdae`.
- PR #26: auth tenant-impersonation bypass removal merged as `bcf8cb4`.
- PR #25: dead-code cleanup and shared helper consolidation merged as `bd9c239`.
- PR #24: engineering command center and session continuity system merged as `5862f73`.
- PR #23: Prisma seed workflow repair merged as `d6942ee`.
- PR #22: documentation source-of-truth system merged as `cfe781d`.
- PR #20: job scheduling engine and document lifecycle history merged as `49ebbd`.
- PR #18: knowledge runtime, project workspace, AI assist, and frontend integration merged as `b4c90a`.

## Current Verification Surface

Backend commands defined in `app/package.json`:

- `npm test`
- `npm run test:integration`
- `npm run lint`
- `npm run build`

Frontend commands defined in `web/package.json`:

- `npm run lint`
- `npm run build`

Documentation commands defined in root `package.json`:

- `npm run docs:test`
- `npm run docs:check -- --base origin/main`

This documentation repair must also pass `git diff --check`.

## Unknowns That Must Stay Unknown Until Verified

- Hosted preview health and founder login click-through.
- Production deployment topology, environment variables, required reviewers, and migration approvals.
- Live GitHub ruleset details unless verified directly through GitHub at execution time.
- Actual `packages/knowledge-engine/**` corpus state beyond open PR metadata, because that package is Claude-owned in PR #33/#34.
- Whether the next product sprint can use production-like data without additional founder-provided credentials or environment access.
