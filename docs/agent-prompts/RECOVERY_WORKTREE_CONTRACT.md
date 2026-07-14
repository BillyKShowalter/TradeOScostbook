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

Policy:

- one clean main worktree
- one linked worktree per active concurrent worker
- short-lived feature branches
- no implementation directly on main
- remove worktrees after merge and verification
- never use `rm -rf` for linked worktree cleanup
