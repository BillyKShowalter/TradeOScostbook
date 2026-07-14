---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app/backend/middleware/auth.ts
  - app/backend/middleware/databaseSession.ts
  - app/db/requestSession.ts
  - app/modules/auth/service.ts
  - app/backend/routes/auth.routes.ts
  - app/backend/routes/account.routes.ts
  - app/backend/routes/organizationProvisioning.routes.ts
  - web/src/app/actions/auth.ts
  - web/src/lib/session.ts
---

# Auth and Tenancy

## Purpose

Authenticate users, resolve organization membership, and establish the RLS-backed tenant session used by all protected API requests.

## Source code locations

- `app/backend/middleware/auth.ts`
- `app/backend/middleware/databaseSession.ts`
- `app/db/requestSession.ts`
- `app/modules/auth/*`
- `app/backend/routes/auth.routes.ts`
- `app/backend/routes/account.routes.ts`
- `app/backend/routes/organizationProvisioning.routes.ts`

## Core models

- `AppUser`
- `OrganizationMembership`
- `OrganizationInvite`
- `AuthRefreshToken`
- `PasswordResetToken`
- `UserTotpCredential`

## Routes

- `POST /api/v1/platform/organizations`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/account`

## Permissions

See [RBAC_MATRIX.md](../RBAC_MATRIX.md).

Special constraints:

- public auth routes are rate-limited
- organization provisioning uses a separate high-entropy secret
- team invites are currently limited to `dispatcher` and `technician`

## Frontend surfaces

- `/login`
- `/signup`
- `web/src/app/actions/auth.ts`

## Tests

- `app/tests/auth.service.test.ts`
- `app/tests/auth.middleware.test.ts`
- `app/tests/platformProvisioningAuth.test.ts`
- `app/tests/platformProvisioningRateLimit.test.ts`
- `app/tests/rls.integration.ts`

## Known limitations

- legacy roles still normalize at session time
- TOTP exists as stored credential scaffolding but is not the primary documented login path

## Deferred work

- further credential hardening beyond the current auth and refresh flow

## Last verified date

2026-07-14
