---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - AGENTS.md
  - docs/TRADEOS_BIBLE.md
  - docs/CURRENT_STATE.md
  - docs/ROADMAP.md
  - docs/SPRINT_BACKLOG.md
  - docs/REPOSITORY_GOVERNANCE.md
  - docs/SESSION_HANDOFF.md
  - docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
---

# TradeOS Engineering Command Center

## Purpose

This document is the concise operating overview for the current TradeOS engineering program. It does not duplicate the full doctrine in the Bible or the detailed algorithm in the agent protocols.

Start with:

1. [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
2. [CURRENT_STATE.md](CURRENT_STATE.md)
3. [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
4. [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
5. [agent-prompts/NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md)

## Project Identity

- `404 TradeOS` is the parent company and operating context.
- `TradeOS` is the contractor SaaS product implemented in this repository.
- The repository remains named `TradeOScostbook`, while the merged product surface and doctrine cover the broader TradeOS platform.

## Current Engineering Phase

TradeOS is in `RC1 hardening`.

Verified implementation truth belongs in [CURRENT_STATE.md](CURRENT_STATE.md). Strategic sequencing belongs in [ROADMAP.md](ROADMAP.md). Executable work belongs in [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md).

## Current Milestone

Current milestone: stabilize the Bible foundation and documentation truth model before resuming general backlog execution.

Immediate goals:

- reconcile the stacked Volume 3 PR with the current Bible foundation branch;
- correct stale live-state claims in the sprint queue and operational docs;
- run complete documentation validation on the combined foundation;
- merge the foundation before destructive consolidation or archive work;
- preserve the large package knowledge corpus until a separate audit proves what is active, vendored, generated, duplicated, or removable.

## Current Product Surface

Verified implemented areas include:

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

Do not infer release readiness from this list. Read [CURRENT_STATE.md](CURRENT_STATE.md) for caveats and verified gaps.

## Canonical Execution Rule

`docs/SPRINT_BACKLOG.md` is the tactical queue. Broad priorities in this document or the roadmap do not override the numbered queue.

An agent may begin work only when:

- the sprint is `READY`;
- its dependencies are merged;
- no open PR or active worktree overlaps its allowed paths;
- required infrastructure is available;
- no founder decision remains unresolved.

If no sprint is eligible, stop and report the blocker instead of inventing work.

## Active PR Coordination

At the last verified handoff:

- PR #30 occupies Settings/Brand Studio web and related current-state scope.
- PR #31 occupies the Bible foundation and sprint-system docs.
- PR #32 occupies `docs/bible/VOLUME_3_ENGINEERING.md` and requires refresh against the current PR #31 head.
- PRs #27, #28, and #29 are merged.

Always verify live GitHub state before editing. This section is an operational summary, not a substitute for GitHub.

## Current Blockers and Risks

- The Bible foundation is not yet merged into `main`.
- The stacked Volume 3 PR is behind its advancing base and is not currently mergeable.
- The sprint backlog still requires a final live-state correction pass.
- Repository ruleset and branch-protection enforcement must be checked against live GitHub before documentation is changed; dated claims are not evidence of present enforcement.
- Entry-point READMEs and legacy generator scripts contain stale material, but they must not be deleted before useful setup, competitive, pricing, or historical evidence is preserved.
- `packages/knowledge-engine/**` contains thousands of documents and requires a separate segmented audit.

## Required Verification

The current required CI job names are expected to include:

- `Docs consistency`
- `App lint, unit tests, and build`
- `App integration tests`
- `Web lint and build`

The exact required-check configuration must be verified against live GitHub rules before governance documentation is declared current.

Run the validation required by the selected sprint. Documentation-only foundation work must at minimum run:

```bash
npm run docs:test
npm run docs:check -- --base origin/main
git diff --check
```

When working on a stacked docs PR, use the actual target base branch for the docs-check comparison where repository tooling supports it.

## Session Startup

Every agent must:

1. verify the exact repository path and worktree;
2. verify branch, clean state, remote, and upstream;
3. fetch origin;
4. read the Bible, Current State, Sprint Backlog, Session Handoff, and Next Sprint Protocol;
5. inspect open PRs, recent merges, and worktree overlap;
6. state mission, allowed paths, forbidden paths, validation, and stop conditions before editing.

## Session Completion

Every agent must:

1. inspect the complete diff against the correct current base;
2. run required validation;
3. update affected source-of-truth owners;
4. update sprint evidence only when justified;
5. replace the session handoff with concise current truth;
6. confirm no unrelated changes;
7. commit and push intentionally;
8. open or update one PR;
9. report the exact next safe action.

## Next Engineer Starts Here

Read [SESSION_HANDOFF.md](SESSION_HANDOFF.md). Reconcile PR #32 with the current PR #31 head before beginning a general sprint. Do not begin archive, deletion, README consolidation, ruleset mutation, or package knowledge-corpus cleanup until the Bible foundation is validated and merged.

## Source-of-Truth Links

- [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
- [CURRENT_STATE.md](CURRENT_STATE.md)
- [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [RBAC_MATRIX.md](RBAC_MATRIX.md)
- [WORKFLOW_LIFECYCLES.md](WORKFLOW_LIFECYCLES.md)
- [ROADMAP.md](ROADMAP.md)
- [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
- [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md)
- [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
- [DOC_OWNERSHIP.yml](DOC_OWNERSHIP.yml)
- [modules/](modules/)
- [decisions/](decisions/)
- [agent-prompts/](agent-prompts/)
