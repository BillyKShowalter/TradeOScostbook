---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - app/backend/server.ts
  - app/backend/routes
  - app/backend/middleware/auth.ts
  - app/backend/middleware/errorHandler.ts
---

# API Reference

## Namespace conventions

The backend is mounted under `/api/v1`.

Special cases:

- `/health` is the unauthenticated health endpoint
- `/admin` is the internal HTML admin surface
- `/api/v1/platform/*` is reserved for organization provisioning
- `/api/v1/auth/*` is public auth

## Authentication expectations

Protected API routes require:

- `Authorization: Bearer <token>`
- a resolvable organization membership
- a request-scoped database session for forced RLS

Tenant impersonation through request-controlled organization headers is not supported.

Public routes are limited to:

- `/api/v1/auth/*`
- `/api/v1/platform/organizations`

## Request and response conventions

- controllers own Zod validation and HTTP shaping
- services return typed DTOs
- browser clients normally talk to the backend through `web/src/lib/api.ts` or `web/src/lib/clientApi.ts`
- binary documents are proxied separately from JSON APIs

## Error conventions

The centralized error handler returns a consistent JSON shape with:

- `error`
- optional `details`

Known Prisma mappings include:

- unique-constraint conflicts to `409`
- foreign-key conflicts to `409`
- record-not-found conditions to `404`

## Route groups

Mounted route groups from `app/backend/server.ts`:

- `/api/v1/account`
- `/api/v1/auth`
- `/api/v1/platform`
- `/api/v1/cost-database`
- `/api/v1/labor-rates`
- `/api/v1/materials`
- `/api/v1/suppliers`
- `/api/v1/equipment`
- `/api/v1/assemblies`
- `/api/v1/estimates`
- `/api/v1/proposals`
- `/api/v1/invoices`
- `/api/v1/contracts`
- `/api/v1/admin`
- `/api/v1/customers`
- `/api/v1/projects`
- `/api/v1/jobs`
- `/api/v1/schedule`
- `/api/v1/notes`
- `/api/v1/change-orders`
- `/api/v1/supplier-integrations`
- `/api/v1/project-intake`
- `/api/v1/knowledge`
- `/api/v1/settings`
- `/api/v1/company`
- `/api/v1/import/customers`
- `/api/v1/brand-studio`
- `/api/v1/intelligence`

## Detailed module links

- [modules/auth-and-tenancy.md](modules/auth-and-tenancy.md)
- [modules/crm.md](modules/crm.md)
- [modules/cost-book.md](modules/cost-book.md)
- [modules/estimating.md](modules/estimating.md)
- [modules/proposals.md](modules/proposals.md)
- [modules/contracts.md](modules/contracts.md)
- [modules/invoices-and-payments.md](modules/invoices-and-payments.md)
- [modules/projects.md](modules/projects.md)
- [modules/jobs-and-scheduling.md](modules/jobs-and-scheduling.md)
- [modules/activity-and-intelligence.md](modules/activity-and-intelligence.md)
- [modules/brand-studio.md](modules/brand-studio.md)
- [modules/customer-portal.md](modules/customer-portal.md)
- [modules/ai-estimate-assist.md](modules/ai-estimate-assist.md)
- [modules/settings-and-operations.md](modules/settings-and-operations.md)
