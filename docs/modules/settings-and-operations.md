---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/settings
  - app/modules/admin-dashboard
  - app/modules/supplier-integration
  - app/modules/supplier-database
  - app/backend/routes/settings.routes.ts
  - app/backend/routes/adminDashboard.routes.ts
  - app/backend/routes/supplierIntegration.routes.ts
  - app/backend/routes/supplierDatabase.routes.ts
  - web/src/app/(app)/settings/page.tsx
  - web/src/components/settings/settings-console.tsx
---

# Settings and Operations

## Purpose

Own the organization settings control center, internal admin summaries, supplier records, and supplier review queue operations.

## Source code locations

- `app/modules/settings/*`
- `app/modules/admin-dashboard/*`
- `app/modules/supplier-integration/*`
- `app/modules/supplier-database/*`
- `web/src/app/(app)/settings/page.tsx`

## Core models

- `OrganizationSettings`
- `Supplier`
- `SupplierPriceUpdate`
- `MaterialPriceAudit`

## Routes

- `/api/v1/settings/*`
- `/api/v1/admin/*`
- `/api/v1/suppliers/*`
- `/api/v1/supplier-integrations/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

Important current rule:

- supplier review and approval are tighter than ordinary queue submission behavior

## Frontend surfaces

- `/settings`
- internal admin HTML surface at `/admin`

## Tests

- `app/tests/admin-dashboard.service.test.ts`
- `app/tests/admin-dashboard.members.test.ts`
- `app/tests/supplier-database.service.test.ts`
- `app/tests/supplier-integration.service.test.ts`
- `app/tests/supplier-integration.scheduler.test.ts`
- `app/tests/supplier-integration.worker.test.ts`

## Implementation notes

- `admin-dashboard`'s `CreateOrganizationInput` and `supplier-integration`'s `SupplierPriceUpdateStatus`/`SupplierFeedQuote` are file-local types; their `export` keyword was removed after confirming no other module imports them by name

## Known limitations

- live supplier feed fetching is still stubbed
- internal admin surfaces are operational tooling, not contractor-facing product routes

## Deferred work

- real supplier feed connectors
- additional operational reporting beyond current queue and admin summaries

## Last verified date

2026-07-14
