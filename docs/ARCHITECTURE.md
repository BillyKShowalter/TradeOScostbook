---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - app/backend/server.ts
  - app/backend/middleware/auth.ts
  - app/backend/middleware/databaseSession.ts
  - app/db/requestSession.ts
  - app/prisma/schema.prisma
  - web/src/lib/api.ts
  - web/src/lib/clientApi.ts
  - web/src/app/api/proxy/[...path]/route.ts
  - web/src/app/api/documents/[...path]/route.ts
---

# Architecture

## Repository layout

TradeOS has two deployable applications and one supporting knowledge package:

- `app/` for the Express and TypeScript API
- `web/` for the Next.js 16 frontend
- `packages/knowledge-engine/` for read-only knowledge/runtime assets

The active product flow is shared across `app/` and `web/`; it is not a set of isolated sub-applications.

## Backend and frontend boundaries

Backend responsibilities:

- authenticate and authorize requests
- establish the tenant-scoped database session
- own HTTP contracts and business services
- enforce lifecycle and permission rules
- generate binary document responses

Frontend responsibilities:

- render the authenticated workspace
- use server components and server actions for most reads and writes
- use the browser proxy only for interactive client-side mutations
- keep bearer tokens out of browser JavaScript

## Tenancy and data architecture

Every authenticated API request depends on three layers:

1. bearer JWT verification
2. organization-membership authorization
3. forced PostgreSQL row-level security inside a scoped database session

The request-scoped database session sets:

- `app.user_id`
- `app.org_id`
- `app.role`
- `app.session_source`

The backend establishes those values in `app/db/requestSession.ts` through a Prisma transaction opened by `app/backend/middleware/databaseSession.ts`.

Background jobs use the same session model through `runWithBackgroundDatabaseSession`.

## Service boundaries

Business logic follows the module pattern:

```text
app/modules/<name>/
  service.ts
  types.ts
```

Controllers own request validation and HTTP shaping. Services take `orgId` explicitly and do not depend on Express request objects.

Route groups are mounted centrally in `app/backend/server.ts`.

## Frontend data paths

Preferred frontend paths:

- server components and server actions call `web/src/lib/api.ts`
- interactive client components call `web/src/lib/clientApi.ts` through `web/src/app/api/proxy/[...path]/route.ts`
- binary document downloads stream through `web/src/app/api/documents/[...path]/route.ts`

## Source-of-truth contract locations

- Roles and lifecycle labels: `app/domain/contracts.ts`
- API route mounting: `app/backend/server.ts`
- Persistent data model: `app/prisma/schema.prisma`
- Forced-RLS request session behavior: `app/backend/middleware/databaseSession.ts` and `app/db/requestSession.ts`
- Web route surface: `web/src/app/**/page.tsx`

Implementation-specific deep dives belong in module docs and ADRs, not in this file.
