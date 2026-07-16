---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - AGENTS.md
  - docs/ENGINEERING_COMMAND_CENTER.md
  - docs/CURRENT_STATE.md
  - docs/ROADMAP.md
  - docs/SPRINT_BACKLOG.md
  - docs/SESSION_HANDOFF.md
  - docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
---

# TradeOS Bible

This is the canonical operating index for TradeOS. It does not replace the source-of-truth documents below; it binds them into one execution system for the founder, Claude, Codex, and future contributors.

## Operating Rule

Every engineering session starts here, then reads the linked current-state, roadmap, sprint, governance, architecture, and handoff documents before editing code.

When a READY sprint exists, the agent selects and executes it through `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`. The founder should not need to write a custom implementation prompt.

## Volume I — Vision and Product Strategy

- `docs/PRODUCT_SCOPE.md`
- `docs/product/TRADEOS_OWNER_EXPERIENCE.md`
- `docs/product/TRADEOS_UX_ADVANTAGES.md`
- `docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md`
- `docs/research/CONTRACTOR_UX_RESEARCH.md`

## Volume II — Product and Domain

- `docs/CURRENT_STATE.md`
- `docs/DOMAIN_MODEL.md`
- `docs/WORKFLOW_LIFECYCLES.md`
- `docs/RBAC_MATRIX.md`
- `docs/modules/`

## Volume III — Engineering and Architecture

- `docs/ARCHITECTURE.md`
- `docs/API_REFERENCE.md`
- `docs/REPOSITORY_GOVERNANCE.md`
- `docs/DOC_OWNERSHIP.yml`
- `docs/decisions/`

## Volume IV — Execution

- `docs/ENGINEERING_COMMAND_CENTER.md`
- `docs/ROADMAP.md`
- `docs/SPRINT_BACKLOG.md`
- `docs/SESSION_HANDOFF.md`
- `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`
- `docs/agent-prompts/AGENT_STARTUP_CHECKLIST.md`
- `docs/agent-prompts/AGENT_COMPLETION_CHECKLIST.md`

## Volume V — Business and Launch

Business, pricing, beta, sales, marketing, and launch documents remain distributed today. They should be linked here as they become source-of-truth artifacts rather than copied into a second competing document.

## Volume VI — Founder Decisions

Architecture and product decisions belong in `docs/decisions/`. Founder-only choices that block engineering must also be recorded on the affected sprint in `docs/SPRINT_BACKLOG.md`.

## Source-of-Truth Hierarchy

1. `docs/CURRENT_STATE.md` — what is implemented now.
2. `docs/SPRINT_BACKLOG.md` — what is executed next.
3. `docs/ROADMAP.md` — strategic sequence and milestones.
4. `docs/ENGINEERING_COMMAND_CENTER.md` — operating policy.
5. `docs/SESSION_HANDOFF.md` — current session handoff only.
6. Module and decision docs — detailed contracts and rationale.

If two documents conflict, the agent must stop, verify current repository evidence, and correct the stale source rather than guessing.

## Maintenance Contract

- One sprint per branch and PR.
- Only merged evidence may mark a sprint DONE.
- Open PR overlap blocks a sprint from READY status.
- Every completed sprint updates its evidence and the session handoff.
- Broad roadmap priorities do not override the numbered sprint queue.
- Agents may not invent replacement architecture when an existing source-of-truth contract applies.
