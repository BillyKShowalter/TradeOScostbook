---
status: current
owner: platform
last_verified: 2026-07-15
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

The backend also exposes a structured AI estimating engine path for contractor-language scopes. It parses scope text, matches Knowledge Runtime candidates, resolves them to existing app-owned cost items or assemblies, retrieves pricing through the costbook and assembly services, and stages a structured draft for human review.

## Source code locations

- `app/modules/ai-estimate-assist/*`
- `app/modules/knowledge-runtime/*`
- `app/backend/routes/aiEstimateAssist.routes.ts`
- `web/src/app/(app)/projects/[id]/estimates/[estimateId]/assist/page.tsx`

## Core models

- this module produces suggestion DTOs rather than owning a separate persisted app model in the current repository

## Routes

- estimate-assist routes mounted under `/api/v1/estimates/*`
- `POST /api/v1/estimates/:id/ai-estimator/draft`
- `POST /api/v1/estimates/:id/ai-estimator/apply`
- knowledge-runtime routes mounted under `/api/v1/knowledge/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

- assist output is advisory only
- accepted suggestions still flow through the ordinary estimate line-item paths
- structured estimator draft generation records only a non-sensitive activity event; it does not create estimate line items
- accepted reviewed lines call the existing Estimate Engine line-item path and never write estimate lines directly from generated output
- structured estimator apply validates accepted targets against org-scoped cost items or assemblies before writing, skips fabricated or foreign targets with the same safe reason, serializes concurrent apply attempts per estimate, and uses server-built `sourceKey` values plus existing-line reconciliation for retry protection
- apply validates any accepted org-owned target supplied by the reviewed payload; it does not currently persist a signed draft-run record proving the target appeared in a prior generated draft

## Frontend surfaces

- `/projects/[id]/estimates/[estimateId]/assist`

## Tests

- `app/tests/ai-estimate-assist.service.test.ts`
- `app/tests/structured-ai-estimator.service.test.ts`
- `app/tests/ai-estimate-assist.controller.test.ts`
- `app/tests/knowledge-runtime.service.test.ts`
- `app/tests/knowledge-runtime.matcher.test.ts`
- `app/tests/knowledge-runtime.controller.test.ts`

## Implementation notes

- `knowledge-runtime/repository.ts` now imports the shared `round2()` helper from `estimate-engine/formulas.ts` instead of defining a duplicate private copy (cleanup only; matcher/scoring behavior unchanged)
- `StructuredAIEstimatorService` is the backend orchestration layer for contractor-language-to-estimate drafts. It is deterministic today, tool-run-oriented, and reuses `KnowledgeRuntimeService`, `CostDatabaseService`, `AssembliesDatabaseService`, and `EstimateEngineService`.

## Known limitations

- no autonomous estimate writes
- runtime is deterministic and read-only
- all generated drafts require human review before line items are applied
- live integration/RLS verification requires the Docker-backed `npm run test:integration` harness
- generated-draft provenance is not persisted as a signed draft run; apply relies on server-side org target validation, human review status, and source-key replay protection

## Deferred work

- any broader learning loop or external-model expansion beyond the current advisory scope

## Last verified date

2026-07-15
