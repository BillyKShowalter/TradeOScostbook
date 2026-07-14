---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/contracts
  - app/backend/routes/contracts.routes.ts
  - web/src/app/(app)/projects/[id]/contracts
  - web/src/app/(app)/portal/contracts
---

# Contracts

## Purpose

Own contract creation from accepted proposals, signature capture, voiding rules, document generation, and event history.

## Source code locations

- `app/modules/contracts/*`
- `app/backend/routes/contracts.routes.ts`
- `web/src/app/(app)/projects/[id]/contracts/**`
- `web/src/app/(app)/portal/contracts/**`

## Core models

- `Contract`
- `ContractEvent`

## Routes

- `/api/v1/contracts/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

See [WORKFLOW_LIFECYCLES.md](../WORKFLOW_LIFECYCLES.md).

## Emitted activity events

- contract creation, signing, and voiding write contract event history

## Frontend surfaces

- `/projects/[id]/contracts/[contractId]`
- `/portal/contracts/[contractId]`

## Tests

- `app/tests/contracts.service.test.ts`
- `app/tests/invoice-contract-history.migration.test.ts`

## Known limitations

- the database still stores `pending_signature` as the pre-signature status

## Deferred work

- any third-party e-sign integration beyond the current in-app signature capture

## Last verified date

2026-07-14
