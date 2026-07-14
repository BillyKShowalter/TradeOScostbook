---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/modules/cost-database
  - app/modules/labor-database
  - app/modules/material-database
  - app/modules/equipment-database
  - app/modules/assemblies-database
  - app/backend/routes/costDatabase.routes.ts
  - app/backend/routes/laborDatabase.routes.ts
  - app/backend/routes/materialDatabase.routes.ts
  - app/backend/routes/equipmentDatabase.routes.ts
  - app/backend/routes/assembliesDatabase.routes.ts
---

# Cost Book

## Purpose

Provide the tenant-scoped estimating catalog: divisions, categories, subcategories, cost items, labor rates, materials, equipment rates, and assemblies.

## Source code locations

- `app/modules/cost-database/*`
- `app/modules/labor-database/*`
- `app/modules/material-database/*`
- `app/modules/equipment-database/*`
- `app/modules/assemblies-database/*`

## Core models

- `Division`
- `Category`
- `Subcategory`
- `CostItem`
- `LaborRate`
- `Material`
- `Equipment`
- `Assembly`
- `AssemblyItem`

## Routes

- `/api/v1/cost-database/*`
- `/api/v1/labor-rates/*`
- `/api/v1/materials/*`
- `/api/v1/equipment/*`
- `/api/v1/assemblies/*`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

## Lifecycle and statuses

- assemblies may be marked `isTemplate` for reusable quick-add behavior
- materials participate in supplier review queue history through related audit records

## Frontend surfaces

- estimate builder and AI estimate assist consume this module through project-estimating surfaces

## Tests

- `app/tests/cost-database.service.test.ts`
- `app/tests/material-price-audit.test.ts`
- `app/tests/assemblies-database.service.test.ts`
- `app/tests/estimate-engine.formulas.test.ts`

## Known limitations

- system-wide shared template catalogs are not the current model; assemblies are tenant-scoped

## Deferred work

- broader supplier ingestion once real feed connectors exist

## Last verified date

2026-07-14
