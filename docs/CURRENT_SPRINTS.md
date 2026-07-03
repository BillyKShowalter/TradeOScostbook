# Current Sprints

Status snapshot as of **2026-07-03**. This file tracks what the active sprint actually shipped and what the next sprint should do. For the full narrative (fleet state, cautions, verification ladder) see [`docs/AGENT_HANDOFF.md`](AGENT_HANDOFF.md).

## Sprint 11 — Project Lifecycle / Operational Workspace (in progress, uncommitted)

**Status:** code-complete in the shared working tree, **not yet committed**. Do not assume `git log` reflects it — check `git status` first.

Sprint 11 turned TradeOS from an estimating tool that stops at document generation into a project-first operations workspace covering the full lifecycle:

`Lead -> Opportunity -> Estimate -> Proposal -> Contract -> Active Job -> Field Execution -> Change Orders -> Closeout -> Warranty -> Archived`

Shipped:

- Reworked project detail into a tabbed **Project Workspace** (Overview, Estimate History, Proposals, Contracts, Invoices, Photos, Documents, Site Visits, Tasks, Change Orders, Timeline, Warranty, Notes, Activity)
- Added a tablet-friendly **Field Dashboard** (large touch targets for photo capture, intake, notes, estimate access, change-order workflows)
- Expanded site visits into structured capture: arrival/departure, GPS placeholder, customer notes, materials needed, safety notes, punch list, measurements, transcript-ready notes, photo upload
- Added a persisted **project task** system (status, priority, assignee, due date, notes, completion)
- Extended change orders with schedule impact, approval/rejection timestamps, approval-history visibility, cost delta display
- Derived a chronological project timeline across customer/project/estimate/site-visit/proposal/contract/invoice/change-order/file/task events
- Upgraded the dashboard toward operations metrics: active jobs, field activity, revenue pipeline, pending contracts/invoices, open change orders, knowledge coverage, estimate lead time
- Wired **AI Estimate Assist** to real data via a new read-only **Knowledge Runtime** bridge (see below) — this supersedes the earlier UI-only mock version referenced in `claude.md` item 42
- Backend unit tests for the new task module; live RLS integration coverage for the new project-task table
- Schema/migration additions without changing existing module boundaries or the auth model

New/extended persistence: `project_tasks`, `site_visits.details_json`, `change_orders.schedule_impact_days`, `change_orders.approved_at`, `change_orders.rejected_at` — all RLS-protected through the existing `projects` join pattern.

Also landed this sprint, in the same working tree: a **Knowledge Engine import** (`packages/knowledge-engine/` — legacy costbook data, scripts, agent pipelines) at commit `e31c1c8`, which is committed locally on `main` but **not yet pushed to `origin/main`**.

**Intentionally not connected in Sprint 11:**

- Scheduling and crew dispatch
- Payroll, accounting, ERP sync, payment processing
- Warranty claims as a first-class backend domain (warranty exists in the lifecycle model and workspace UI, not as a persisted domain)
- A dedicated event-log table (timeline/activity are still derived from source-record timestamps)
- AI suggestion acceptance/rejection telemetry
- Weather, inspection, equipment, crew-log event sources

## Sprint 12 — Recommended: Harden the Operational Lifecycle

Sprint 12 should not expand surface area — it should make Sprint 11's lifecycle durable and closeable. Suggested deliverables, roughly in priority order:

1. **Persist lifecycle events.** Add a backend-owned event table and make it the source for the project timeline and dashboard activity feed, replacing timestamp-derivation.
2. **Customer-facing change-order acceptance.** Add signed acceptance capture on top of the current internal approval timestamps, mirroring the existing contract-signature pattern.
3. **First-class warranty module.** Claim records, reminders, closeout handoff metadata — currently only represented in the lifecycle model and UI copy.
4. **Document versioning and metadata.** Structured document taxonomy and version visibility for plans, permits, and closeout packages, without replacing the existing project-file storage model.
5. **AI suggestion review telemetry.** Log estimator accept/reject decisions on Knowledge Runtime matches so the executive dashboard can report a real acceptance rate instead of an instrumentation gap.

### Explicitly out of scope for Sprint 12 (unless priorities change)

- Scheduling or dispatch workflows
- Payroll or accounting integrations
- Inventory management
- CRM redesign
- RAG or Knowledge-Runtime persistence rewrites (see [`docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`](KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md) — the runtime is deliberately file-backed and read-only right now)
- Broad architecture rewrites or framework migrations

## Knowledge Engine status

Short version — see [`docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`](KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md), [`docs/TRAININGLESS_AI_ESTIMATING_DEMO.md`](TRAININGLESS_AI_ESTIMATING_DEMO.md), and [`docs/TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md`](TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md) for the full picture:

- `packages/knowledge-engine/` (legacy costbook data, scripts, agent pipelines) was imported at commit `e31c1c8` — not yet pushed to `origin/main`.
- `app/modules/knowledge-runtime/` is a **read-only** bridge that loads Knowledge Engine JSON/Markdown files directly from disk and exposes deterministic search/match endpoints (`GET /api/v1/knowledge/stats|trades|search`, `POST /api/v1/knowledge/match`).
- No Prisma schema changes, no Knowledge Engine package mutation, no Supabase import, no vector search/pgvector/RAG, no external AI calls, no automatic estimate writes. Everything routes through human review.
- The runtime is **process-memory cached** — file changes require a process restart or test-level cache reset.
- Trade/assembly coverage is uneven; several parallel agent branches (see `docs/AGENT_HANDOFF.md`'s fleet section) are actively adding more Knowledge Engine content batch-by-batch. Check open PRs before starting new Knowledge Engine import work to avoid duplicating another agent's in-flight batch.
- Next evolution steps (not started): a versioned import boundary into app-managed tables, estimator accept/reject feedback logging, connecting approved matches to the existing line-item add flow.
