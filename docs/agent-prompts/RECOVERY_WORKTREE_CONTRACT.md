---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - docs/agent-prompts/AGENT_STARTUP_CHECKLIST.md
---

# Recovery Worktree Contract

Recovery worktrees are temporary.

Use them only to:

- inspect a blocked branch safely
- replay or verify a fix without touching the main worktree
- recover from a branch or worktree mismatch

Required checks:

- verify exact path, branch, status, upstream, and worktree list
- define the narrow recovery scope and explicit stop conditions
- do not broaden recovery work into feature delivery without a fresh task boundary
- report exact Git status and PR readiness before handing the branch back

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no permanent branch per module
- no implementation directly on main
- recovery worktrees are temporary
- remove worktrees after merge and verification
- verify the branch is clean, merged, or intentionally preserved before cleanup
- use `git worktree remove`, not `rm -rf`
- never use `rm -rf` for linked worktree cleanup
