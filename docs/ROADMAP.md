---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - docs/CURRENT_STATE.md
  - app/backend/server.ts
  - web/src/app
---

# Roadmap

## Current milestone

RC1 hardening.

## Upcoming milestones

### Documentation governance

- finish the source-of-truth hierarchy
- require documentation updates in the same PR as affected code
- keep archived plans preserved but non-authoritative

### Lifecycle normalization

- reduce persisted legacy status values where compatibility shims remain
- align contract pre-signature naming with canonical lifecycle language
- continue narrowing project status drift between stored values and canonical display states

### Release hardening

- keep repository verification stable
- improve customer-portal hardening
- verify production deployment and environment approval posture outside the codebase

## Deferred capabilities

- live supplier feed ingestion beyond the current queue and scheduler scaffolding
- advanced dispatch optimization
- route planning
- public payment processing
- payroll and accounting integrations
- inventory management

## Technical debt

- legacy roles remain in compatibility mode
- several lifecycle states still normalize older stored values
- older setup notes and deep-dive documents required archival and should stay archived

## Explicit non-goals

- redesigning the application architecture
- splitting the project workflow into separate products
- replacing RLS with app-only filtering
- inventing speculative abstractions ahead of verified product need
