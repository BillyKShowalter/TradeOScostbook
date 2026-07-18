---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - AGENTS.md
  - docs/README.md
---

# Agent Startup Checklist

Every agent must verify:

- exact worktree path
- exact branch
- clean working tree
- remote repository target
- current upstream branch
- active worktree list
- allowed paths
- forbidden paths
- task scope
- explicit exclusions and no-scope-expansion rule
- source-of-truth documents
- engineering command center
- previous session handoff
- open PR or branch overlap
- documentation impact review
- stop conditions

Required rule:

“Do not interpret ‘continue’ as permission to select a different task or broaden scope.”

Minimum startup commands:

- `pwd`
- `git branch --show-current`
- `git status --short --branch`
- `git remote -v`
- `git fetch origin`
- `git rev-parse --abbrev-ref --symbolic-full-name @{upstream}`
- `git worktree list`

Stop immediately if:

- the worktree path is wrong
- the branch is wrong
- the working tree is dirty when the task requires a clean start
- the remote repository target is not the expected repository
- the upstream branch is not the expected branch for the task
- the allowed paths, forbidden paths, or explicit exclusions are unclear
- the requested scope reaches forbidden paths
- the source-of-truth documents needed for the task have not been identified
