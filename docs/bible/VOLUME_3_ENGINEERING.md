---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
---

# TradeOS Bible — Volume 3: Engineering

## Purpose

This volume defines the architectural, security, data, testing, and deployment rules that govern implementation.

## Architecture posture

TradeOS is a monorepo with a web application, backend application, Prisma/Postgres data layer, shared documentation, and knowledge/runtime packages. Existing architecture should be extended before new parallel systems are introduced.

## Engineering principles

### Preserve one source of truth

Do not create duplicate auth, organization, estimating, branding, scheduling, or document systems without an explicit architecture decision.

### Trusted tenancy context

Organization identity must come from verified authentication/session context, never caller-controlled headers or request fields.

### Service-bound writes

Controllers validate input and authorization; domain services perform consequential writes. AI-generated output must not bypass service boundaries.

### Transactional integrity

Multi-write operations that represent one business action must either complete together or fail together.

### Idempotency and retry safety

Externally retried or AI-assisted actions require deterministic duplicate protection where repeated execution could create financial or operational duplication.

### Database enforcement

RLS, constraints, uniqueness, foreign keys, and migrations should enforce critical invariants rather than relying only on UI behavior.

### Compatibility with explicit retirement

Temporary lifecycle aliases or compatibility shims must be documented, tested, and scheduled for removal.

## Security baseline

- authenticated organization context;
- least-privilege role checks;
- org-scoped service queries;
- live RLS integration tests;
- bounded input and file validation;
- signed or otherwise verifiable review provenance for AI-assisted apply flows;
- secret fail-closed behavior in production;
- no secrets or local environment files committed;
- audit/activity evidence for consequential changes.

## Testing pyramid

### Static verification

- TypeScript compile/type checking;
- lint;
- documentation ownership and consistency;
- whitespace/diff checks.

### Unit tests

Domain behavior, validation, lifecycle transitions, duplicate protection, and failure paths.

### Integration tests

Postgres-backed RLS, migrations, transaction behavior, and critical service/database interaction.

### Browser verification

Key user workflows, console errors, accessibility, responsive behavior, and external-infrastructure interactions when credentials exist.

## Required merge checks

- `Docs consistency`
- `App lint, unit tests, and build`
- `App integration tests`
- `Web lint and build`

## Branch and worktree policy

- one mission per branch;
- one linked worktree per active mission;
- no direct implementation on shared `main`;
- branches current with `origin/main` before readiness;
- no plain force push;
- final diff reviewed against current base;
- no merge with failing required checks or unresolved review threads.

## Deployment posture

Production readiness requires more than a successful local build. It includes migration review, environment configuration, approval posture, rollback expectations, observability, and post-deploy verification.

## Related sources

- `docs/ARCHITECTURE.md`
- `docs/API_REFERENCE.md`
- `docs/DOMAIN_MODEL.md`
- `docs/REPOSITORY_GOVERNANCE.md`
- `docs/DOC_OWNERSHIP.yml`
- `docs/decisions/`
