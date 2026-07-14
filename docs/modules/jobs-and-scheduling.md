---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/jobs
  - app/backend/routes/jobs.routes.ts
  - app/prisma/schema.prisma
  - web/src/app/(app)/projects/[id]/page.tsx
---

# Jobs and Scheduling

## Purpose

Own first-class field-execution jobs, technician assignments, dispatch transitions, schedule conflict detection, and ready-for-invoice signaling.

## Source code locations

- `app/modules/jobs/*`
- `app/backend/routes/jobs.routes.ts`

## Core models

- `Job`
- `JobAssignment`
- `JobEquipment`

## Routes

- `/api/v1/jobs`
- `/api/v1/jobs/:jobId/*`
- `/api/v1/schedule`
- `/api/v1/schedule/conflicts`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

Important job-specific rules:

- manager roles are `owner`, `admin`, and `dispatcher`
- technician field access is scoped to active assignments
- schedule conflict overrides are owner/admin only

## Lifecycle and statuses

See [WORKFLOW_LIFECYCLES.md](../WORKFLOW_LIFECYCLES.md).

## Emitted activity events

- job scheduling, rescheduling, dispatch, movement through field states, assignment changes, conflict overrides, reopening, and archiving write activity records

## Frontend surfaces

- jobs currently surface through the project workspace and related project detail pages

## Tests

- `app/tests/jobs.service.test.ts`
- `app/tests/jobs.controller.test.ts`
- `app/tests/jobs.migration.test.ts`
- `app/tests/rls.integration.ts`

## Known limitations

- richer dispatcher board UX remains separate from the core backend engine

## Deferred work

- advanced dispatch optimization and route planning

## Last verified date

2026-07-14
