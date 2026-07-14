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
- confirm allowed backend paths
- load the relevant global docs and module docs
- identify documentation impact before code changes

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no permanent branch per module
- no implementation directly on main
- remove worktrees after merge and verification
- never use `rm -rf` for linked worktree cleanup
