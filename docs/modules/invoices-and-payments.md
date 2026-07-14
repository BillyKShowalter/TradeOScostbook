---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/invoices
  - app/backend/routes/invoices.routes.ts
  - app/backend/routes/crm.routes.ts
  - web/src/app/(app)/projects/[id]/invoices
  - web/src/app/(app)/portal/invoices
---

# Invoices and Payments

## Purpose

Own invoice creation, send and pay state changes, voiding, line items, delivery history, and payment recording.

## Source code locations

- `app/modules/invoices/*`
- `app/backend/routes/invoices.routes.ts`
- payment routes in `app/backend/routes/crm.routes.ts`
- `web/src/app/(app)/projects/[id]/invoices/**`

## Core models

- `Invoice`
- `InvoiceLineItem`
- `InvoiceDelivery`
- `Payment`

## Routes

- `/api/v1/invoices/*`
- `/api/v1/invoices/:id/payments`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

See [WORKFLOW_LIFECYCLES.md](../WORKFLOW_LIFECYCLES.md).

## Frontend surfaces

- `/projects/[id]/invoices/new`
- `/projects/[id]/invoices/[invoiceId]`
- `/portal/invoices/[invoiceId]`

## Tests

- `app/tests/invoices.service.test.ts`
- `app/tests/invoice-contract-history.migration.test.ts`

## Known limitations

- payment recording exists, but public payment processing does not

## Deferred work

- deeper accounts-receivable automation and external payment integration

## Last verified date

2026-07-14
