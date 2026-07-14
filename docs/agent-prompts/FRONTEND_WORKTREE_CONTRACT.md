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
- identify whether the change affects module docs, current state, API reference, RBAC, or lifecycle docs

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no implementation directly on main
- remove worktrees after merge and verification
- never use `rm -rf` for linked worktree cleanup
