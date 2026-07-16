---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - AGENTS.md
  - .github/workflows/docs-consistency.yml
  - .github/workflows/verify-repository.yml
  - .github/pull_request_template.md
  - docs/TRADEOS_BIBLE.md
  - docs/ENGINEERING_COMMAND_CENTER.md
  - docs/SPRINT_BACKLOG.md
  - docs/SESSION_HANDOFF.md
  - docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
  - docs/decisions/ADR-004-worktree-policy.md
---

# Repository Governance

This document defines the required repository workflow for TradeOS. The Bible defines doctrine, the Sprint Backlog defines executable work, and this file defines repository controls and merge discipline.

## Live-state verification rule

GitHub rulesets, branch protection, required checks, merge methods, and review requirements are external state. They must be verified directly in GitHub before being described as current.

Do not preserve dated statements such as “no rulesets exist” or “one approval is required” as present truth after configuration may have changed.

## Required protection target

Protect `main` with a branch ruleset that:

- requires a pull request before merging;
- requires the branch to be current with `main`;
- requires all configured status checks to pass;
- requires conversation resolution;
- blocks force pushes;
- restricts deletion of `main`.

Expected verification jobs are:

- `Docs consistency`;
- `App lint, unit tests, and build`;
- `App integration tests`;
- `Web lint and build`.

The exact GitHub check names remain the source of truth and must be verified before editing the ruleset.

## Solo-maintainer review posture

TradeOS is currently operated by one repository maintainer. The intended solo-maintainer configuration is:

- pull requests remain mandatory;
- required checks remain mandatory;
- conversation resolution remains mandatory;
- required approving-review count is zero while there is only one maintainer;
- self-review may be recorded as a comment or audit, but it is not treated as independent approval;
- approval requirements may be raised when another qualified maintainer or reviewer joins.

Do not weaken CI, up-to-date requirements, deletion protection, force-push protection, or PR requirements to compensate for the zero-approval setting.

## Merge posture

- prefer squash merge for normal feature, fix, and documentation PRs;
- do not merge a draft PR;
- do not merge with failing required checks;
- do not merge with unresolved review threads;
- verify the expected head SHA immediately before merge;
- only merged evidence may mark a sprint `DONE`.

## Branch and worktree lifecycle

Use one clean `main` worktree plus one linked worktree per active mission.

Standard flow:

1. fetch origin;
2. verify exact repository, path, branch, upstream, and clean state;
3. create one short-lived branch and linked worktree for the bounded mission;
4. state allowed paths, forbidden paths, validation, and stop conditions;
5. inspect open PR and worktree overlap;
6. perform only the approved mission;
7. update required source-of-truth documents in the same branch;
8. run required local checks;
9. inspect the complete diff against the correct base;
10. push normally and open or update one PR;
11. wait for required checks;
12. merge only after review readiness is established;
13. sync `main` and verify the landed content;
14. remove linked worktrees with `git worktree remove`;
15. delete merged branches when safe;
16. run `git worktree prune`.

Required policy:

- do not develop directly on `main`;
- do not use permanent per-module feature branches;
- do not use plain force push;
- use `--force-with-lease` only when a reviewed rebase requires it and the remote head is verified unchanged;
- do not use `rm -rf` to remove linked worktrees;
- stop on unexpected branch movement or overlapping scope.

## Documentation ownership

`docs/DOC_OWNERSHIP.yml` is enforced repository policy.

When a changed file triggers an ownership requirement, the owning document must be included and updated meaningfully in the same PR. Do not add an empty or cosmetic edit merely to satisfy the checker.

The Bible does not replace:

- `CURRENT_STATE.md` for verified implementation truth;
- `SPRINT_BACKLOG.md` for executable work;
- `SESSION_HANDOFF.md` for current continuity;
- module docs for detailed implementation contracts;
- accepted ADRs for active architectural rationale;
- research docs for supporting evidence.

## Session continuity

Every contributor starts with:

1. `AGENTS.md`;
2. `docs/TRADEOS_BIBLE.md`;
3. `docs/CURRENT_STATE.md`;
4. `docs/SPRINT_BACKLOG.md`;
5. `docs/SESSION_HANDOFF.md`;
6. `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`.

`ENGINEERING_COMMAND_CENTER.md` is a concise operating overview, not a running log. `SESSION_HANDOFF.md` is replaced with current truth at the end of a substantive session.

## Pull request readiness

A PR is ready for human review only when:

- work stayed within its approved scope;
- required owner documents are present;
- the final diff contains no unrelated changes;
- local validation has passed or an external blocker is explicitly documented;
- GitHub required checks are green;
- the branch is up to date;
- review threads are resolved;
- the PR description accurately states current scope, validation, limitations, and remaining risks.
