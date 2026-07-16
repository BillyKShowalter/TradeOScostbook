---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - docs/SPRINT_BACKLOG.md
  - docs/ENGINEERING_COMMAND_CENTER.md
  - docs/SESSION_HANDOFF.md
---

# Next Sprint Protocol

Use this protocol when the founder asks an agent to continue TradeOS engineering work without supplying a custom task prompt.

This protocol does not authorize broad exploration, multiple sprints, or speculative work. It selects exactly one safe sprint from [SPRINT_BACKLOG.md](../SPRINT_BACKLOG.md).

## Selection Algorithm

1. Fetch origin.
2. Verify clean worktree and branch.
3. Read Command Center, Current State, Sprint Backlog, and Session Handoff.
4. Inspect live open PRs and recent merges.
5. Ignore `DONE`, `IN_REVIEW`, `BLOCKED`, `DEFERRED`, and `CANCELLED`.
6. Select the lowest-numbered `READY` sprint whose dependencies are merged.
7. Confirm no open PR or worktree overlaps its allowed paths.
8. State mission, scope, tests, stop conditions, and expected PR before editing.
9. Create a dedicated worktree and branch.
10. Execute only that sprint.
11. Update the sprint record with evidence.
12. Update `SESSION_HANDOFF.md`.
13. Open a draft PR.
14. Never automatically begin a second sprint in the same branch.

If no sprint is safely `READY`, stop and report the exact blocker. Do not invent work.

## Required Live Checks

Before selecting a sprint, inspect:

- current `origin/main`
- open PRs and their changed files
- recently merged PRs and merge commits
- active local worktrees
- active local and remote branches
- current GitHub check names and conclusions
- current known blockers and technical debt in source-of-truth docs

Do not rely on stale dates or old handoff claims when live GitHub state disproves them.

## Eligibility Rules

A sprint is eligible only when all of these are true:

- Status is exactly `READY`.
- Every `S###` dependency is `DONE` or otherwise merged into `origin/main`.
- Every PR dependency references a merged PR.
- `Blocked by:` is `none`.
- `Founder decision required:` is `NO`.
- No open PR touches the sprint's allowed paths or conflict paths.
- No active worktree is already working on the same scope.
- Required infrastructure is available or the sprint's own stop conditions explain how to classify the blocker.

## Execution Rules

- Use one branch and one worktree per sprint.
- Stay inside the sprint's `Allowed paths`.
- Treat `Forbidden paths` and `Explicit exclusions` as hard stop boundaries.
- Run every command in `Required tests` unless the sprint's stop conditions classify an environment blocker.
- Update the sprint's `Completion evidence` before handoff.
- Update `docs/SESSION_HANDOFF.md` at the end of the sprint.
- Open a draft PR and stop.
- Do not merge the PR unless the founder explicitly requests it.
- Do not start the next sprint after opening the PR.

## Copy/Paste Startup Prompt

```text
Read AGENTS.md, docs/ENGINEERING_COMMAND_CENTER.md,
docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md,
docs/SESSION_HANDOFF.md, and
docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md.
Inspect live GitHub PR and branch state.
Select the next eligible READY sprint using the documented protocol.
Do not ask the founder to choose unless the selected sprint explicitly
requires a founder decision.
Create an isolated worktree and branch, execute exactly one sprint,
run all required validation, update the sprint evidence and handoff,
push, and open a draft PR.
Stop on scope conflict, stale remote state, failed required checks,
unavailable infrastructure, or product ambiguity.
```
