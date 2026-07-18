---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - AGENTS.md
  - docs/CURRENT_STATE.md
  - docs/ROADMAP.md
  - docs/REPOSITORY_GOVERNANCE.md
  - docs/SESSION_HANDOFF.md
---

# TradeOS Engineering Command Center

## 1. Project Identity

- `404 TradeOS` is the parent organization context for the company, development business, and related admin or marketing operations.
- `TradeOS` is the contractor SaaS product implemented in this repository.
- The current repository is named `TradeOScostbook`, but the live docs and merged product surface already reflect a broader TradeOS platform.
- This document does not rename the repository. It establishes the engineering operating context for the current codebase.

## 2. Current Engineering Phase

TradeOS is in `RC1 hardening`.

Authoritative reference:

- [CURRENT_STATE.md](CURRENT_STATE.md)

## 3. Current Milestone

Current milestone: `Lifecycle normalization`

Goal:

- align project, estimate, proposal, contract, invoice, and job lifecycle states across persistence, APIs, shared contracts, workspace UI, and customer portal surfaces without redesigning the architecture

Explicit exclusions:

- live supplier-feed ingestion
- advanced dispatch optimization
- automated route optimization
- fleet-routing intelligence
- automatic technician-routing decisions
- public payment processing
- broad UI redesign
- architecture rewrite
- unrelated feature expansion

These exclusions do not remove the existing jobs, scheduling, technician-assignment, dispatcher, or field-work coordination surface already implemented in TradeOS.

Authoritative reference:

- [ROADMAP.md](ROADMAP.md)
- [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
- [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
- [NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md)

## 3.1 Canonical Execution Queue

- [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md) is the canonical operating index for TradeOS source-of-truth docs.
- [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md) is the canonical executable sprint queue.
- [NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md) is the canonical autonomous startup procedure when the founder asks an agent to run the next sprint.
- Broad priorities in this Command Center do not override the numbered sprint queue.
- Agents execute one sprint per branch and PR.
- Only merged evidence can mark a sprint `DONE`.
- If no sprint is safely `READY`, agents stop and report the blocker instead of inventing work.

## 4. Current Product Surface

Verified implemented areas:

- [Auth and tenancy](modules/auth-and-tenancy.md)
- [CRM](modules/crm.md)
- [Projects and workspace](modules/projects.md)
- [Cost book](modules/cost-book.md)
- [Estimating](modules/estimating.md)
- [AI Estimate Assist](modules/ai-estimate-assist.md)
- [Proposals](modules/proposals.md)
- [Contracts](modules/contracts.md)
- [Invoices and payments](modules/invoices-and-payments.md)
- [Jobs and scheduling](modules/jobs-and-scheduling.md)
- [Activity and intelligence](modules/activity-and-intelligence.md)
- [Brand Studio](modules/brand-studio.md)
- [Settings and operations](modules/settings-and-operations.md)
- [Customer portal](modules/customer-portal.md)

See [CURRENT_STATE.md](CURRENT_STATE.md) for the verified module list and implementation caveats.

Current operational scope already includes:

- customer -> project -> job coordination
- job creation and assignment
- technician assignment
- scheduling and rescheduling
- dispatcher-managed workload coordination within current RBAC limits
- field-work status coordination from scheduling through completion and invoice readiness

## 5. Top Engineering Priorities

1. Lifecycle normalization
Objective: remove conflicting lifecycle language between storage, APIs, and UI.
Why it matters: status drift is a release-readiness risk across project, proposal, contract, invoice, and job flows.
Definition of done: canonical lifecycle labels and transitions read the same way across shared contracts, persistence, APIs, workspace UI, and portal surfaces, with compatibility shims reduced or explicitly documented.
Reference: [ROADMAP.md](ROADMAP.md), [WORKFLOW_LIFECYCLES.md](WORKFLOW_LIFECYCLES.md)

2. Repository verification and governance stability
Objective: keep required checks, ownership rules, and worktree policy reliable.
Why it matters: RC1 hardening fails if merges can skip verification or if current docs drift from implementation.
Definition of done: branch policy is documented, docs-check stays low-noise, and the required verification path remains reproducible locally and in CI.
Reference: [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md), [DOC_OWNERSHIP.yml](DOC_OWNERSHIP.yml)

3. Customer portal hardening
Objective: tighten the contractor-visible portal experience without expanding product scope.
Why it matters: the portal is already live in the repo and remains an explicit RC follow-through area.
Definition of done: portal behaviors and document views are release-ready enough that CURRENT_STATE no longer flags portal hardening as an RC follow-up item.
Reference: [CURRENT_STATE.md](CURRENT_STATE.md), [ROADMAP.md](ROADMAP.md), [modules/customer-portal.md](modules/customer-portal.md)

4. Production deployment and environment approval verification
Objective: verify the real production approval posture outside the codebase.
Why it matters: deployment confidence cannot be inferred only from tracked code or local test success.
Definition of done: environment approvals, migration rollout expectations, and production verification steps are confirmed against the live GitHub and deployment environment setup.
Reference: [CURRENT_STATE.md](CURRENT_STATE.md), [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md), [.github/workflows/deploy-migrations.yml](../.github/workflows/deploy-migrations.yml)

5. Stale draft PR cleanup and truth-drift reduction
Objective: reduce overlap from old draft PRs that predate recent merged work.
Why it matters: outdated draft branches compete with the current source-of-truth docs and can mislead future sessions.
Definition of done: active drafts are reviewed for overlap, clearly triaged in handoff, and future work starts from current main instead of stale branch assumptions.
Reference: [SESSION_HANDOFF.md](SESSION_HANDOFF.md), [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md)

## 6. Current Blockers and Risks

- Release blocker: lifecycle compatibility values remain active for projects, proposals, and contracts, so the same business stage can still appear under different stored and display labels.
- Technical debt: supplier connector plumbing exists, but live supplier feed ingestion is still stubbed.
- Technical debt: cost-item and assembly substring search still lacks trigram coverage for `code` columns, so mixed name-or-code queries can remain scan-heavy.
- Environment verification gap: production deployment state, environment approvals, and migration-review posture must be verified outside the repository.
- Verified governance state: a live default-branch ruleset exists as of 2026-07-16; S003 in the sprint backlog verifies and documents the final solo-maintainer posture without changing GitHub settings.
- Open PR overlap: PR #30 owns Settings brand-asset upload persistence and must not be duplicated.

Authoritative references:

- [CURRENT_STATE.md](CURRENT_STATE.md)
- [ROADMAP.md](ROADMAP.md)
- [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md)

## 7. Recently Landed Work

- `279bdae` / PR [#27](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/27): added contractor UX research and Founder Preview product specs.
- `10ec35e` / PR [#29](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/29): hardened the structured AI Estimator engine and reviewed apply flow.
- `f032808` / PR [#28](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/28): added the Founder Preview needs-attention dashboard workflow.
- `d6942ee` / PR [#23](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/23): repaired the Prisma seed workflow so root-level seeding works under forced RLS.
- `cfe781d` / PR [#22](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/22): established the current documentation source-of-truth system, ownership rules, and governance baseline.
- `9a7760b` / PR [#21](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/21): restored canonical role and lifecycle contracts that earlier branch history had orphaned.
- `49ebbd7` / PR [#20](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/20): added the job scheduling engine and document lifecycle history.
- `91002f8` / PR [#19](https://github.com/404TradeOS-LLC/TradeOScostbook/pull/19): integrated the TradeOS Blueprint design system and consolidated shared web UI patterns.

## 8. Active Branch and PR Policy

- Engineering policy is that `main` is merge-only and must be treated as protected.
- Verified on 2026-07-16: a GitHub ruleset named `TradeOS Main Branch Protection` is active for the default branch, requires PRs, strict required status checks, linear history, conversation resolution, and blocks deletion and non-fast-forward updates.
- Feature, fix, chore, and docs branches are short-lived.
- Use one linked worktree per mission.
- Do not do direct runtime implementation work in the shared governance worktree.
- Branches must be current with `origin/main` before PR readiness.
- Required CI target checks are:
  - `Docs consistency`
  - `App lint, unit tests, and build`
  - `App integration tests`
- `Web lint and build`
- Documentation must change with implementation whenever [DOC_OWNERSHIP.yml](DOC_OWNERSHIP.yml) requires it.
- Ownership rules include module-specific controllers and middleware when those files define validation, permission, rate-limit, or security behavior, not only service directories.

See [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md) for the full policy, cleanup lifecycle, and manual GitHub settings still needed.

## 9. Session Startup Protocol

Every agent must:

1. verify exact path
2. verify branch
3. verify clean state
4. verify remote and upstream
5. fetch origin
6. inspect this Command Center
7. read [CURRENT_STATE.md](CURRENT_STATE.md)
8. read [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
9. inspect open PR and branch overlap
10. state mission, allowed paths, forbidden paths, exclusions, verification plan, and stop conditions before editing

## 10. Session Completion Protocol

Every agent must:

1. inspect the final diff
2. run required tests and checks
3. update affected source-of-truth docs
4. update this Command Center only when mission, priorities, blockers, risks, release state, CI requirements, or operating protocol changed
5. replace [SESSION_HANDOFF.md](SESSION_HANDOFF.md) with the current concise handoff
6. confirm no unrelated changes
7. commit and push
8. report exact final `git status --short --branch`
9. state PR readiness
10. identify the precise next task

## 11. Next Engineer Starts Here

Read [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md), [SESSION_HANDOFF.md](SESSION_HANDOFF.md), and [NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md). Then select the lowest-numbered eligible `READY` sprint from [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md). Do not start unrelated feature work, and never begin a second sprint in the same branch.

## 12. Source-of-Truth Links

- [CURRENT_STATE.md](CURRENT_STATE.md)
- [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [RBAC_MATRIX.md](RBAC_MATRIX.md)
- [WORKFLOW_LIFECYCLES.md](WORKFLOW_LIFECYCLES.md)
- [ROADMAP.md](ROADMAP.md)
- [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
- [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
- [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md)
- [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
- [DOC_OWNERSHIP.yml](DOC_OWNERSHIP.yml)
- [modules/](modules/)
- [decisions/](decisions/)
- [agent-prompts/](agent-prompts/)
