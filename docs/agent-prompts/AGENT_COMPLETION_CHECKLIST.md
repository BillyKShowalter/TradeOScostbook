---
status: current
owner: platform
last_verified: 2026-07-14
source_of_truth: false
related_code:
  - docs/README.md
  - docs/DOC_OWNERSHIP.yml
---

# Agent Completion Checklist

Every task report must include:

- files created
- files modified
- documentation impact
- tests and checks run
- checks passed
- checks failed
- checks blocked by environment
- commit list
- exact Git status
- upstream state
- PR readiness
- known limitations
- deferred work

Always include:

- whether scope stayed inside the allowed paths
- whether any stop condition was encountered
- whether final branch state is ready for review without extra documentation work

Required rule:

“The task is incomplete when code changes require documentation updates that are not included in the same branch and PR.”
