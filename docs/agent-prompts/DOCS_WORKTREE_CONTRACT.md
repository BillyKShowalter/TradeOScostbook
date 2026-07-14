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
- fetch origin before trusting the upstream comparison
- read `docs/ENGINEERING_COMMAND_CENTER.md` and `docs/SESSION_HANDOFF.md`
- confirm that changes stay inside allowed documentation and workflow paths
- confirm forbidden runtime and product-code paths
- identify which global docs, module docs, ADRs, or archive files will change
- identify the source-of-truth files that control the task
- record explicit stop conditions before editing
- record explicit exclusions before editing

Required startup checks:

- exact worktree path
- exact branch
- clean working tree when a clean start is required
- expected upstream branch
- allowed paths and forbidden paths
- no scope expansion and no reinterpretation of `continue`

Required completion checks:

- refresh `docs/SESSION_HANDOFF.md` for substantive or PR-ready work
- update `docs/ENGINEERING_COMMAND_CENTER.md` only when engineering operating context changed
- documentation impact reviewed
- exact final `git status --short --branch` reported
- commits and PR readiness reported
- no required source-of-truth update left out of the branch

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
