# Project Status

## Sprint 11 status

TradeOS now operates as a project-first construction workspace instead of stopping at estimating and document generation.

Completed in this sprint:

- Reworked the project detail route into a tabbed Project Workspace with operational views for overview, estimate history, proposals, contracts, invoices, photos, documents, site visits, tasks, change orders, timeline, warranty, notes, and activity
- Added a tablet-friendly Field Dashboard with large touch targets for photo capture, intake, notes, estimate access, and change-order workflows
- Expanded site visits into a richer structured capture flow with arrival, departure, GPS placeholder, customer notes, materials needed, safety notes, punch list, measurements, transcript-ready notes, and photo upload support
- Added a lightweight persisted project task system with status, priority, assignee, due date, notes, and completion tracking
- Extended change orders with schedule impact, approval and rejection timestamps, approval-history visibility, cost delta display, and project workspace controls
- Expanded the project payload and timeline derivation so customer creation, project creation, estimates, site visits, proposals, contracts, invoices, change orders, files, and task completion can appear in one chronological feed
- Upgraded the dashboard toward operations with active jobs, field-activity visibility, revenue pipeline, pending contracts, pending invoices, open change orders, knowledge coverage, and estimate lead-time metrics
- Added backend unit tests for the new task module and live RLS coverage for the new project task table
- Added Prisma schema and migration updates without rewriting the existing module boundaries or auth model

## Current system posture

- Backend, frontend, estimate assist, project intake, proposal workflow, contract workflow, invoice workflow, customer portal views, project tasks, structured site visits, and change orders are connected
- The operational workspace reuses the existing REST API, server actions, JWT auth, Prisma, and forced PostgreSQL RLS model
- Human review remains mandatory before estimate writes and before customer-facing proposal, contract, invoice, or change-order decisions
- No scheduling, payroll, accounting, inventory, or CRM rewrite was introduced
- Project documents and field photos continue to use the existing project-file storage model instead of a parallel document subsystem

## Still intentionally not connected

- Scheduling and crew dispatch
- Payroll, accounting, ERP sync, and payment processing
- Dedicated warranty claims as a first-class backend domain
- Persisted lifecycle event log tables separate from the derived activity timeline
- AI suggestion acceptance telemetry and long-term knowledge feedback logging
- Weather, inspection, equipment, and crew-log event sources beyond future-ready documentation

## Repo-state note

Documentation concerns improved in this sprint:

- `docs/PROJECT_LIFECYCLE.md` was added
- `docs/EXECUTIVE_REPOSITORY_AUDIT.md` was added

The following documents are still useful future documentation gaps:

- `docs/KNOWLEDGE_ENGINE_STATUS.md`
- `docs/TECHNICAL_DEBT.md`
