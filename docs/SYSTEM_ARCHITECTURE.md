# System Architecture

## Overview

TradeOS remains a two-application system:

- `app/` is the Express and TypeScript backend API
- `web/` is the Next.js front-end application

The product shape now extends past estimating into operations:

`Lead -> Opportunity -> Estimate -> Proposal -> Contract -> Active Job -> Field Execution -> Change Orders -> Closeout -> Warranty -> Archived`

Sprint 11 keeps that expansion inside the existing architecture rather than replacing it.

## Backend architecture

### Runtime

- Node 20+
- Express
- Prisma
- PostgreSQL
- Forced row-level security

### Security model

Every `/api/v1/*` request still depends on three layers:

1. Bearer JWT verification
2. Organization-membership authorization
3. PostgreSQL RLS inside a scoped request transaction

The request transaction sets:

- `app.user_id`
- `app.org_id`
- `app.role`

That transaction-scoped context is what lets the database enforce tenant isolation even if application filtering were missed.

### Module pattern

Business modules continue to live in `app/modules/<name>/` and use:

- `types.ts`
- `service.ts`

Services take `orgId` explicitly and do not depend on Express request objects.

### Operational workflow modules

Core lifecycle modules now include:

- `app/modules/proposals/`
- `app/modules/proposal-generator/`
- `app/modules/contracts/`
- `app/modules/invoices/`
- `app/modules/change-orders/`
- `app/modules/project-tasks/`
- `app/modules/project-intake/`

Sprint 11 extends these boundaries without changing ownership:

- Proposal lifecycle stays in `proposals/service.ts`
- Contract lifecycle stays in `contracts/service.ts`
- Invoice lifecycle stays in `invoices/service.ts`
- Change-order pricing and approvals stay in `change-orders/service.ts`
- Task persistence lives in `project-tasks/service.ts`
- Site-visit intelligence stays in `project-intake/service.ts` with richer structured payload capture in the project controller layer

### Persistence additions in Sprint 11

Sprint 11 adds or extends project-scoped storage with:

- `project_tasks`
- `site_visits.details_json`
- `change_orders.schedule_impact_days`
- `change_orders.approved_at`
- `change_orders.rejected_at`

Each new or extended project-owned record remains protected by the same RLS pattern:

- visibility joins back through `projects`
- writes require `current_app_can_write()`
- live integration tests verify tenant isolation

## Frontend architecture

### Runtime

- Next.js App Router
- React Server Components by default
- Server Actions for authenticated mutations

### Data flow

- Server components read the session token on the server
- Authenticated requests use `web/src/lib/api.ts`
- Binary PDFs route through `web/src/app/api/documents/[...path]/route.ts`
- Mutations continue to use server actions in `web/src/app/actions/`

### UI organization

Sprint 11 keeps the UI compositional:

- `web/src/components/shared/` for workflow primitives
- `web/src/components/projects/` for project workspace tabs, forms, field dashboard, and operational panels
- `web/src/components/proposals/` for proposal lifecycle UI
- `web/src/components/contracts/` for signing flow UI

The project route remains the operational hub:

- `web/src/app/(app)/projects/[id]/page.tsx`

That page now assembles:

- tab navigation
- the main workspace content
- the reusable right-rail project sidebar

### Timeline and dashboard derivation

`web/src/lib/document-workflow.ts` remains the shared derivation layer for:

- proposal display states
- invoice display states
- project activity timeline items
- dashboard metrics
- notification summaries

Sprint 11 expands those derivations to include:

- customer creation
- site visits
- change orders
- task completion
- project file additions

These are still derived from source records rather than stored in a dedicated event-log table.

## Project Workspace architecture

The Project Workspace is intentionally not a separate application shell.

It is an expansion of the existing project detail route using:

- server-rendered project fetches
- project-scoped REST endpoints
- server actions for create and status-change operations
- reusable presentational components for each tab

Workspace tabs currently cover:

- Overview
- Estimate History
- Proposals
- Contracts
- Invoices
- Photos
- Documents
- Site Visits
- Tasks
- Change Orders
- Timeline
- Warranty
- Notes
- Activity

## Field operations architecture

Sprint 11 introduces field-oriented capabilities without adding a separate mobile backend:

- structured site-visit capture remains project-scoped
- project files remain the shared document and photo storage layer
- field dashboard actions deep-link into the existing project routes
- task management is intentionally lightweight and project-owned

This keeps field execution inside the same customer-project-estimate lifecycle instead of branching into a second system.

## Known intentional gaps

The following remain future work by design:

- scheduling and dispatch
- payroll and accounting
- inventory
- dedicated warranty claims module
- persisted event-log tables for timeline and activity
- AI suggestion review telemetry for executive metrics
