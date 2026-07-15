---
status: current
owner: platform
last_verified: 2026-07-15
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

## Implementation notes

- `EstimateEngineService` now imports the shared `round2()` helper from `estimate-engine/formulas.ts` instead of defining a duplicate private copy (cleanup only; no change to pricing behavior)
- `EstimateLineItem.sourceKey` is optional and is used for backend-generated idempotency/replay protection on reviewed structured-AI apply calls. Manual line-item creation remains unrestricted by source key.

## Known limitations

- downstream commercial workflows still rely on compatibility status normalization in some paths

## Deferred work

- fuller estimate lifecycle normalization beyond the current finalize step

## Last verified date

2026-07-15
