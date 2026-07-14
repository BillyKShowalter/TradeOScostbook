---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - web
  - docs/modules/projects.md
  - docs/modules/customer-portal.md
---

# Frontend Worktree Contract

Use one linked worktree for one frontend task.

Before editing:

- verify path, branch, status, upstream, and worktree list
- confirm allowed frontend paths
- confirm forbidden backend, schema, and migration paths
- identify whether the change affects module docs, current state, API reference, RBAC, or lifecycle docs
- record exact task scope and stop conditions

Required startup checks:

- exact worktree path
- exact branch
- clean working tree when a clean start is required
- expected upstream branch
- allowed paths and forbidden paths
- source-of-truth docs for the touched frontend surface
- no interpretation of `continue` as permission to broaden scope

Required completion checks:

- report exact Git status
- report commits created
- report PR readiness
- confirm required docs were updated with the same branch when implementation status changed

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
