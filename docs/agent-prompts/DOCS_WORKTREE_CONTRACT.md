---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - docs
  - .github
  - scripts/docs-check.mjs
---

# Docs Worktree Contract

Use one linked worktree for one documentation-governance task.

Before editing:

- verify path, branch, status, upstream, and worktree list
- confirm that changes stay inside allowed documentation and workflow paths
- identify which global docs, module docs, ADRs, or archive files will change

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no implementation directly on main
- remove worktrees after merge and verification
- never use `rm -rf` for linked worktree cleanup
