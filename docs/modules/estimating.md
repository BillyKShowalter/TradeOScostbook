---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/estimate-engine
  - app/backend/routes/estimateEngine.routes.ts
  - web/src/app/(app)/projects/[id]/estimates
  - web/src/lib/estimate-compare.ts
---

# Estimating

## Purpose

Own estimate creation, line-item pricing, pricing mode changes, duplication, comparison, and finalize-to-ready behavior.

## Source code locations

- `app/modules/estimate-engine/*`
- `app/backend/routes/estimateEngine.routes.ts`
- `web/src/app/(app)/projects/[id]/estimates/**`

## Core models

- `Estimate`
- `EstimateLineItem`

## Routes

- `/api/v1/estimates/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

See [WORKFLOW_LIFECYCLES.md](../WORKFLOW_LIFECYCLES.md).

Current enforced rule:

- estimate mutations are draft-only until the estimate is finalized to `ready`

## Frontend surfaces

- `/projects/[id]/estimates/[estimateId]`
- `/projects/[id]/estimates/compare`
- `/projects/[id]/estimates/[estimateId]/assist`

## Tests

- `app/tests/estimate-engine.service.test.ts`
- `app/tests/estimate-engine.formulas.test.ts`

## Known limitations

- downstream commercial workflows still rely on compatibility status normalization in some paths

## Deferred work

- fuller estimate lifecycle normalization beyond the current finalize step

## Last verified date

2026-07-14
