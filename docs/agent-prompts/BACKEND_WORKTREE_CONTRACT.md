---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - app
  - docs/modules/auth-and-tenancy.md
  - docs/API_REFERENCE.md
---

# Backend Worktree Contract

Use one linked worktree for one backend task.

Before editing:

- verify path, branch, status, upstream, and worktree list
- fetch origin before trusting the upstream comparison
- read `docs/ENGINEERING_COMMAND_CENTER.md` and `docs/SESSION_HANDOFF.md`
- confirm allowed backend paths
- confirm forbidden paths that are out of scope for the task
- load the relevant global docs and module docs
- record the exact task scope and stop conditions
- record explicit exclusions
- identify documentation impact before code changes

Required startup checks:

- exact worktree path
- exact branch
- clean working tree when a clean start is required
- expected upstream branch
- allowed paths and forbidden paths
- source-of-truth documents that govern the touched module
- no interpretation of `continue` as permission to broaden scope

Required completion checks:

- refresh `docs/SESSION_HANDOFF.md` for substantive or PR-ready work
- update `docs/ENGINEERING_COMMAND_CENTER.md` only if operating context changed
- report exact final `git status --short --branch`
- report commits created
- report PR readiness
- report whether required docs changed in the same branch

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no permanent branch per module
- no implementation directly on main
- recovery worktrees are temporary
- remove worktrees after merge and verification
- verify the branch is merged or intentionally preserved before cleanup
- use `git worktree remove`, not `rm -rf`
- never use `rm -rf` for linked worktree cleanup
