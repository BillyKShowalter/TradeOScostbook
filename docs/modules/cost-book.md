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
  - app/modules/admin-dashboard
  - app/prisma/migrations/20260703090000_add_search_trgm_indexes/migration.sql
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

Representative search behavior:

- `GET /api/v1/cost-database/cost-items/search` performs case-insensitive substring matching against both `name` and `code`
- assembly search uses the same name-or-code substring pattern in the service layer
- material name filtering currently appears in the admin pricing-audit history query through a case-insensitive `contains` filter
- supplier name trigram indexing is present for the expected next search-as-you-type surface, but there is no dedicated supplier substring-search route yet

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

## Implementation notes

- `cost-database` and `assemblies-database` services import the shared `round2()` rounding helper from `estimate-engine/formulas.ts` rather than each defining their own private copy (cleanup only; rounding behavior unchanged)

## Known limitations

- system-wide shared template catalogs are not the current model; assemblies are tenant-scoped
- only `name` columns are trigram-indexed today, so combined name-or-code substring search may still scan when the planner has to satisfy the `code` branch
- the current migration uses standard `CREATE INDEX`; future low-lock rollout work would need a separate `CREATE INDEX CONCURRENTLY` strategy if production table size makes that necessary
- RLS impact is none; these indexes change planner choices, not authorization boundaries

## Deferred work

- broader supplier ingestion once real feed connectors exist
- evaluate trigram indexing for `code` search paths if substring code lookup becomes a measurable bottleneck

## Last verified date

2026-07-14
