---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/crm/service.ts
  - app/backend/routes/crm.routes.ts
  - app/prisma/schema.prisma
  - web/src/app/(app)/customers
  - web/src/app/actions/customers.ts
---

# CRM

## Purpose

Own customer records, service addresses, customer equipment, service agreements, notes, customer import, and company profile data used by the project workflow.

## Source code locations

- `app/modules/crm/*`
- `app/backend/routes/crm.routes.ts`
- `web/src/app/(app)/customers/**`
- `web/src/app/actions/customers.ts`

## Core models

- `Customer`
- `ServiceAddress`
- `CustomerEquipment`
- `ServiceAgreement`

## Routes

- `GET|POST /api/v1/customers`
- `GET|PATCH|DELETE /api/v1/customers/:id`
- `POST|PATCH|DELETE /api/v1/customers/:id/service-addresses/*`
- `POST|PATCH|DELETE /api/v1/customers/:id/equipment/*`
- `GET|POST /api/v1/customers/:id/service-agreements`
- `GET|POST /api/v1/notes`
- `POST /api/v1/import/customers`
- `GET|PATCH /api/v1/company`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

- customer records support soft delete through `deleted_at`
- equipment assets use a free-form `status` field
- service agreements default to `draft`

## Emitted activity events

- notes and related operational actions may feed broader activity surfaces through the intelligence primitives

## Frontend surfaces

- `/customers`
- `/customers/new`
- `/customers/[id]`

## Tests

- `app/tests/crm.service.test.ts`

## Known limitations

- CRM remains intentionally project-centered rather than a separate pipeline subsystem

## Deferred work

- richer communication history and deeper service-agreement workflows

## Last verified date

2026-07-14
