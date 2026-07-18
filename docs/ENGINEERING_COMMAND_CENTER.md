---
status: current
owner: platform
last_verified: 2026-07-18
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

This is the concise operating overview for TradeOS engineering. It does not replace the Bible, Current State, Sprint Backlog, Session Handoff, module contracts, ADRs, or research evidence.

Start with:

1. [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
2. [CURRENT_STATE.md](CURRENT_STATE.md)
3. [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
4. [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
5. [agent-prompts/NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md)

## Project Identity

- `404 TradeOS` is the parent company and operating context.
- `TradeOS` is the contractor SaaS product in this repository.
- The repository remains named `TradeOScostbook`, while the implemented surface and doctrine cover the broader TradeOS platform.

## Current Engineering Phase

TradeOS is in `RC1 hardening`.

Verified implementation truth belongs in [CURRENT_STATE.md](CURRENT_STATE.md). Strategic sequencing belongs in [ROADMAP.md](ROADMAP.md). Executable work belongs in [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md). Immediate continuity belongs in [SESSION_HANDOFF.md](SESSION_HANDOFF.md).

The TradeOS Bible foundation is merged on `main` as PR #31, commit `ac72ff235db687d9cb8619820e536aec040afc6b`.

## Active Mission Lanes

| Lane | Owner | Branch / PR | Status | Dependencies | Collision warnings |
| --- | --- | --- | --- | --- | --- |
| Founder decisions | Founder | none | WAITING | S014, S024, S039, S044, S045, S048 need founder or environment input before execution. | Do not resolve product-source, retention/privacy/cost, production access, secret rotation, backup, beta-tenant, or rollout-date decisions by inference. |
| First-party truth repair | Codex | PR #35, `docs/first-party-truth-repair` | IN_REVIEW | Based on `origin/main` at PR #31 merge commit. | Do not touch `packages/knowledge-engine/**`, PR #30 files, runtime code, `app/**` implementation, or `web/**` implementation. |
| Knowledge-engine Phase A | Claude | PR #33, `docs/knowledge-engine-phase-a-guardrails` | OPEN | Owns knowledge-engine guardrails and related governance/doc-ownership changes. | Do not edit PR #33 branch or `packages/knowledge-engine/**`. Expect doc-file overlap with this repair branch in `docs/README.md`, `docs/DOC_OWNERSHIP.yml`, `docs/REPOSITORY_GOVERNANCE.md`, and this file. |
| Knowledge-engine Phase B/C readiness | Claude | PR #34, `fix/knowledge-engine-canonical-paths` stacked on PR #33 | OPEN | Depends on PR #33 branch. | Do not inspect or classify package internals from this branch. |
| Brand Studio asset persistence | Product PR | PR #30, `fix/brand-studio-asset-upload-persistence` | OPEN | Independent Brand Studio/Settings web work. | Do not modify, review, rebase, merge, or mark complete from this branch. |

## Current Blockers And Risks

- S003 is blocked by open PR #33 overlap and live GitHub ruleset verification requirements.
- S013 remains `IN_REVIEW` until PR #30 merges.
- S014 requires a founder decision on Settings branding versus Brand Studio ownership.
- S024 requires a founder decision on AI draft-run retention, privacy, provenance, and cost policy.
- S039, S044, and S045 require production or live environment access.
- Hosted preview health, demo credentials, production topology, GitHub rulesets, and environment approvals remain unknown until verified directly.
- `packages/knowledge-engine/**` is Claude-owned during PR #33/#34 and must not be edited or reclassified here.

## Next Review Order

1. Review and merge or close PR #35 after docs validation is green.
2. Review Claude PR #33 before any governance/doc-ownership sprint work.
3. Review Claude PR #34 after PR #33 state is understood because it is stacked on the Phase A branch.
4. Review PR #30 separately; it is unrelated Brand Studio asset-persistence work.
5. Re-evaluate S003 only after PR #33 is resolved and GitHub ruleset facts can be verified.

## Canonical Execution Rule

The Sprint Backlog is the tactical queue. An agent may begin only when:

- the sprint is `READY`;
- every sprint dependency is `DONE`;
- no overlapping PR or worktree exists;
- required external infrastructure is available;
- no founder decision remains unresolved.

If no sprint is eligible, stop and report the blocker instead of inventing work.

## Required Verification

Expected CI jobs include:

- `Docs consistency`;
- `App lint, unit tests, and build`;
- `App integration tests`;
- `Web lint and build`.

Documentation-control work must run:

```bash
npm run docs:test
npm run docs:check -- --base origin/main
git diff --check
```

The exact required-check configuration remains live GitHub state.

## Session Startup

Every agent must:

1. verify repository path, worktree, branch, upstream, and clean state;
2. fetch origin;
3. read the Bible, Current State, Sprint Backlog, Session Handoff, and Next Sprint Protocol;
4. inspect open PRs, recent merges, and worktree overlap;
5. state mission, allowed paths, forbidden paths, validation, and stop conditions.

## Session Completion

Every agent must:

1. inspect the complete diff against the correct base;
2. run required validation;
3. update affected source-of-truth owners;
4. update sprint evidence only when justified;
5. replace the session handoff with concise current truth;
6. confirm no unrelated changes;
7. commit and push intentionally;
8. open or update one PR;
9. report the exact next safe action.

## Next Engineer Starts Here

Read [SESSION_HANDOFF.md](SESSION_HANDOFF.md). Do not begin product work while S003 is blocked, S004 is in review, PR #30 remains open, and Claude owns PR #33/#34 knowledge-engine lanes.

## Source-Of-Truth Links

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
