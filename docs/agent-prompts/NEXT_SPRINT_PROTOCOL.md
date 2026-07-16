# TradeOS Next Sprint Protocol

Use this protocol for Claude, Codex, or any future engineering agent.

## Selection Algorithm

1. Fetch `origin`.
2. Verify exact repository path, current branch, clean state, remote, and upstream.
3. Read:
   - `AGENTS.md`
   - `docs/TRADEOS_BIBLE.md`
   - `docs/ENGINEERING_COMMAND_CENTER.md`
   - `docs/CURRENT_STATE.md`
   - `docs/SPRINT_BACKLOG.md`
   - `docs/SESSION_HANDOFF.md`
   - `docs/REPOSITORY_GOVERNANCE.md`
4. Inspect live open PRs, recent merges, and existing worktrees.
5. Ignore sprints with status `DONE`, `IN_REVIEW`, `BLOCKED`, `DEFERRED`, or `CANCELLED`.
6. Starting from the lowest sprint number, select the first `READY` sprint whose dependencies are merged and whose paths do not overlap an active PR or worktree.
7. If a sprint marked `READY` is no longer eligible, do not execute it. Report the stale status and correct the backlog in a docs-only PR.
8. State the selected sprint ID, objective, allowed paths, forbidden paths, tests, stop conditions, branch, and worktree before editing.
9. Create one isolated worktree and one branch for that sprint.
10. Execute exactly one sprint.
11. Run the sprint's required checks plus ownership-required documentation checks.
12. Update the sprint's status and completion evidence only after the relevant GitHub state exists.
13. Replace `docs/SESSION_HANDOFF.md` with a concise current handoff.
14. Push and open a draft PR.
15. Do not automatically begin another sprint from the same branch.

## Stop Conditions

Stop without pushing when:

- the selected sprint overlaps an open PR or another active worktree;
- a dependency is not merged;
- the founder decision field is `YES` and the decision is unresolved;
- current repository evidence contradicts the sprint contract;
- required infrastructure is unavailable;
- a required test fails;
- the remote branch moves unexpectedly;
- implementation requires paths listed as forbidden;
- the task expands into architecture not approved by a source-of-truth document.

## Completion Contract

Every completed agent report must include:

- sprint ID and title;
- original and final commit SHA;
- files changed;
- tests passed;
- tests failed or blocked;
- documentation updated;
- push result;
- PR number and URL;
- remaining risks;
- whether the sprint is ready for review;
- exact next safe action.

## Copy/Paste Startup Prompt

```text
Read AGENTS.md, docs/TRADEOS_BIBLE.md,
docs/ENGINEERING_COMMAND_CENTER.md, docs/CURRENT_STATE.md,
docs/SPRINT_BACKLOG.md, docs/SESSION_HANDOFF.md, and
docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md.

Fetch origin and inspect live GitHub PR, branch, and worktree state.
Select the lowest-numbered eligible READY sprint using the documented protocol.
Do not ask the founder to choose unless that sprint explicitly requires a founder decision.

Create an isolated worktree and branch, execute exactly one sprint,
run all required validation, update sprint evidence and SESSION_HANDOFF,
push, and open a draft PR.

Stop on scope conflict, stale remote state, failed required checks,
unavailable infrastructure, unresolved founder decision, or product ambiguity.
```

## Founder Shortcut

The founder may now say:

```text
Run the next TradeOS sprint.
```

That instruction means: follow this protocol exactly. It does not authorize bypassing checks, rewriting unrelated code, merging without review of the resulting diff, or beginning multiple sprints in one branch.
