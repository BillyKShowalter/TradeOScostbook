---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/ai-estimate-assist
  - app/modules/knowledge-runtime
  - app/backend/routes/aiEstimateAssist.routes.ts
  - web/src/app/(app)/projects/[id]/estimates/[estimateId]/assist/page.tsx
  - web/src/components/estimate-assist
---

# AI Estimate Assist

## Purpose

Provide advisory estimate suggestions grounded in the tenant cost book and reviewed by a human before anything reaches the estimate.

## Source code locations

- `app/modules/ai-estimate-assist/*`
- `app/modules/knowledge-runtime/*`
- `app/backend/routes/aiEstimateAssist.routes.ts`
- `web/src/app/(app)/projects/[id]/estimates/[estimateId]/assist/page.tsx`

## Core models

- this module produces suggestion DTOs rather than owning a separate persisted app model in the current repository

## Routes

- estimate-assist routes mounted under `/api/v1/estimates/*`
- knowledge-runtime routes mounted under `/api/v1/knowledge/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

- assist output is advisory only
- accepted suggestions still flow through the ordinary estimate line-item paths

## Frontend surfaces

- `/projects/[id]/estimates/[estimateId]/assist`

## Tests

- `app/tests/ai-estimate-assist.service.test.ts`
- `app/tests/knowledge-runtime.service.test.ts`
- `app/tests/knowledge-runtime.matcher.test.ts`
- `app/tests/knowledge-runtime.controller.test.ts`

## Known limitations

- no autonomous estimate writes
- runtime is deterministic and read-only

## Deferred work

- any broader learning loop or external-model expansion beyond the current advisory scope

## Last verified date

2026-07-14
