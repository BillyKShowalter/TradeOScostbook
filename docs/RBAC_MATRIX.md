---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - app/domain/contracts.ts
  - app/modules/auth/service.ts
  - app/modules/jobs/service.ts
---

# RBAC Matrix

## Canonical roles

Current canonical roles:

- `owner`
- `admin`
- `dispatcher`
- `technician`

Legacy compatibility mappings:

- `estimator` maps to canonical `dispatcher`
- `viewer` maps to canonical `technician`

Legacy roles are compatibility inputs only. New documentation and new product claims must use the canonical role names.

## Shared permission model

Shared permission keys from `app/domain/contracts.ts`:

- `team.manage`
- `company.manage`
- `settings.manage`
- `crm.read`
- `crm.write`
- `dispatch.manage`
- `billing.read`
- `billing.write`
- `documents.manage`
- `notes.write`
- `activity.read`

## Major-module permissions

| Module | owner | admin | dispatcher | technician |
| --- | --- | --- | --- | --- |
| Team and organization management | Full | Full except ownership transfer semantics | Company/settings oriented management only where granted by shared permissions | No |
| CRM and projects | Read/write | Read/write | Read/write | Read-only |
| Jobs and scheduling | Full including overrides | Full including overrides | Manages dispatch and assignments without owner-only overrides | Field-scoped access only |
| Proposals, contracts, invoices | Full | Full | Operational document and billing support | Read-only |
| Structured AI estimator draft/apply | Full through `billing.write` | Full through `billing.write` | Operational estimating support through `billing.write` | No write access |
| Notes and activity | Full | Full | Full | Can write notes and read activity |
| Brand Studio and settings | Full | Full | Supported through `settings.manage` and `company.manage` | No |

## Tenant-boundary behavior

- all roles are tenant-scoped by organization membership
- no role bypasses RLS
- cross-organization reads and writes are denied by session-scoped RLS
- request headers cannot select or impersonate a tenant

## Assigned-technician restrictions

Jobs have extra scope restrictions beyond the shared permission map:

- technicians can only access jobs where they have an active assignment
- technicians can accept or decline only their own assignments
- technicians may move assigned jobs through field states that the service permits
- owners and admins can override schedule conflicts
- only owners and admins can reopen completed jobs

## Current auth-specific constraints

- first-owner provisioning creates an `owner`
- team invites are currently limited to `dispatcher` and `technician` roles
- compatibility values may still appear in stored memberships but are normalized during auth/session resolution
