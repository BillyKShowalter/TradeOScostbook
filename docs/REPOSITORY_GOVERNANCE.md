---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: true
related_code:
  - AGENTS.md
  - .github/workflows/docs-consistency.yml
  - .github/workflows/verify-repository.yml
  - .github/pull_request_template.md
  - docs/agent-prompts/AGENT_STARTUP_CHECKLIST.md
  - docs/agent-prompts/AGENT_COMPLETION_CHECKLIST.md
  - docs/decisions/ADR-004-worktree-policy.md
---

# Repository Governance

This document defines the required repository workflow for TradeOS governance, hardening, and feature delivery.

## Current GitHub state

Verified from GitHub CLI and API on 2026-07-14:

- default branch: `main`
- branch protection on `main`: not configured
- repository rulesets: none
- merge methods allowed: merge commit, rebase, and squash
- automatic deletion of merged head branches: disabled
- currently required status checks: none
- require branch to be up to date before merge: not configured
- required conversation resolution: not configured
- approval requirement: not configured
- force-push blocking for `main`: not configured
- branch deletion blocking for `main`: not configured

Recent pull requests have successful runs for these safe-to-require checks:

- `Docs consistency`
- `App lint, unit tests, and build`
- `App integration tests`
- `Web lint and build`

## Required protection target

Protect `main` with a branch ruleset, not an ad hoc convention.

Minimum required rules:

- require a pull request before merging
- require these status checks:
  - `Docs consistency`
  - `App lint, unit tests, and build`
  - `App integration tests`
  - `Web lint and build`
- require the branch to be up to date before merging
- require conversations to be resolved before merging
- block force pushes
- block deletions

Recommended additional review guardrail:

- require at least 1 approving review before merge

Merge posture:

- keep squash merge enabled
- prefer squash merge for normal PR flow
- if the team wants hard enforcement instead of preference, disable merge commits and rebase merges in repository merge settings after confirming that no active workflow depends on them

Branch cleanup posture:

- enable automatic deletion of merged head branches
- do not allow deletion of `main`

## Manual GitHub UI steps

Use manual configuration until repository-admin automation is intentionally introduced.

### Branch ruleset for `main`

1. Open `BillyKShowalter/TradeOScostbook` on GitHub.
2. Go to `Settings`.
3. In the left sidebar, open `Rules`, then `Rulesets`.
4. Click `New ruleset`, then `New branch ruleset`.
5. Name the ruleset `Protect main`.
6. Set enforcement to `Active`.
7. Target branch pattern `main`.
8. Enable `Require a pull request before merging`.
9. Inside the pull-request rule, enable `Require conversation resolution before merging`.
10. Enable `Require status checks to pass`.
11. Select these checks:
    - `Docs consistency`
    - `App lint, unit tests, and build`
    - `App integration tests`
    - `Web lint and build`
12. Enable the strict up-to-date option so branches must be current before merge.
13. Enable `Block force pushes`.
14. Enable `Restrict deletions`.
15. If the repository owner wants approval enforcement, enable `Require approvals` and set it to `1`.
16. Save the ruleset.

### Merge settings and branch cleanup

1. In the same repository, go to `Settings`.
2. Open `General`.
3. Under `Pull Requests`, keep `Allow squash merging` enabled.
4. If the team decides to enforce squash-only merges, disable `Allow merge commits` and `Allow rebase merging`.
5. Enable `Automatically delete head branches`.

## Standard worktree lifecycle

Use one clean main worktree plus one linked worktree per active concurrent worker.

Standard flow:

1. Start from a clean `main` worktree.
2. Run `git fetch origin`.
3. Create a short-lived branch and linked worktree for the bounded task.
4. Verify the exact path, branch, upstream, status, and worktree list.
5. Confirm allowed paths, forbidden paths, task scope, and stop conditions.
6. Perform only the bounded task.
7. Update required source-of-truth docs in the same branch.
8. Run the required local checks.
9. Push the branch.
10. Open a pull request.
11. Wait for required checks to pass.
12. Squash merge the PR.
13. Sync the clean `main` worktree and verify the merged content.
14. Remove the linked worktree with `git worktree remove`.
15. Delete the merged branch locally and remotely if it is no longer needed.
16. Run `git worktree prune` to clear stale metadata.

Required policy:

- use one branch per feature or governance task
- use one worktree per active concurrent worker
- do not keep permanent per-module branches
- do not develop directly on `main`
- keep recovery worktrees temporary
- use `git worktree remove`, never `rm -rf`, for linked-worktree cleanup

## Pull request readiness

A branch is review-ready only when:

- work stayed inside the allowed paths for the task
- required documentation updates are present in the same branch
- the final `git status --short --branch` is clean except for intended staged or committed changes
- the contributor can report exact checks run, exact checks still blocked, and the current upstream target
