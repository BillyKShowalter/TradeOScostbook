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

This is the concise operating overview for TradeOS engineering. It does not replace the Bible, Current State, Sprint Backlog, Session Handoff, module contracts, ADRs, or research evidence.

Start with:

1. [TRADEOS_BIBLE.md](TRADEOS_BIBLE.md)
2. [CURRENT_STATE.md](CURRENT_STATE.md)
3. [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md)
4. [SESSION_HANDOFF.md](SESSION_HANDOFF.md)
5. [agent-prompts/NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md)

## Project identity

- `404 TradeOS` is the parent company and operating context.
- `TradeOS` is the contractor SaaS product in this repository.
- The repository remains named `TradeOScostbook`, while the implemented surface and doctrine cover the broader TradeOS platform.

## Current engineering phase

TradeOS is in `RC1 hardening`.

Verified implementation truth belongs in [CURRENT_STATE.md](CURRENT_STATE.md). Strategic sequencing belongs in [ROADMAP.md](ROADMAP.md). Executable work belongs in [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md).

## Current milestone

Finish and land the Bible foundation before resuming general sprint execution.

Completed foundation work includes:

- seven Bible volumes;
- a 50-sprint dependency-ordered backlog;
- a mechanical next-sprint protocol;
- merged Volume 3 engineering expansion from PR #32;
- corrected sprint dependency logic;
- updated handoff and governance integration;
- preservation of the large knowledge-engine corpus pending a separate audit.

Remaining foundation work:

- rerun complete local docs validation on the final head;
- inspect the final docs-only diff and links;
- wait for GitHub checks;
- move PR #31 from draft only after all required validation is green.

## Canonical execution rule

The Sprint Backlog is the tactical queue. An agent may begin only when:

- the sprint is `READY`;
- every sprint dependency is `DONE`;
- no overlapping PR or worktree exists;
- required external infrastructure is available;
- no founder decision remains unresolved.

If no sprint is eligible, stop and report the blocker instead of inventing work.

## Active PR coordination

At the last verified handoff:

- PR #30 owns Settings/Brand Studio web and related current-state scope;
- PR #31 owns the Bible foundation and sprint-system documentation;
- PR #32 is merged into PR #31’s branch;
- PRs #27, #28, and #29 are merged.

Always verify GitHub before editing. This summary is not a substitute for live PR state.

## Current blockers and risks

- PR #31 is not yet merged, so the Bible remains proposed canonical doctrine until it lands on `main`.
- The final validation pass must be rerun after adding the governance owner document.
- Entry-point READMEs and legacy generator scripts contain stale material, but useful setup, competitive, pricing, and historical evidence must be preserved before archive or removal decisions.
- `packages/knowledge-engine/**` (9,986 files) received its separate segmented audit on 2026-07-16, and Phase A documentation/governance guardrails (root README, corrected canonical-path docs, focused `docs/DOC_OWNERSHIP.yml` rules, historical notices on conflicting runtime guidance, a package-scoped `.gitignore`) have landed. The package still contains a confirmed 4,746-tracked-file self-nested exact-duplicate tree and ~1,400 vendored third-party skill directories with incomplete license coverage; both are documented but intentionally untouched pending founder-approved Phase B/C/D migration work — do not begin archive or deletion in this package without that approval.
- Ruleset and branch-protection facts must be verified directly in GitHub before being stated as current.

## Required verification

Expected CI jobs include:

- `Docs consistency`;
- `App lint, unit tests, and build`;
- `App integration tests`;
- `Web lint and build`.

Documentation foundation work must run:

```bash
npm run docs:test
npm run docs:check -- --base origin/main
git diff --check
```

The exact required-check configuration remains live GitHub state.

## Session startup

Every agent must:

1. verify repository path, worktree, branch, upstream, and clean state;
2. fetch origin;
3. read the Bible, Current State, Sprint Backlog, Session Handoff, and Next Sprint Protocol;
4. inspect open PRs, recent merges, and worktree overlap;
5. state mission, allowed paths, forbidden paths, validation, and stop conditions.

## Session completion

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

## Next engineer starts here

Read [SESSION_HANDOFF.md](SESSION_HANDOFF.md). Rerun final PR #31 validation on the latest head. Do not begin archive, deletion, README consolidation, ruleset mutation, or package knowledge-corpus cleanup until the foundation is validated and merged.

## Source-of-truth links

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
