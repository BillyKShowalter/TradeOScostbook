---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - docs/ENGINEERING_COMMAND_CENTER.md
  - docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
  - docs/SESSION_HANDOFF.md
---

# TradeOS Sprint Backlog

This is the canonical executable engineering queue for TradeOS. The Roadmap remains the strategic view; this backlog is the tactical one-sprint-at-a-time execution system.

Status vocabulary is limited to `DONE`, `IN_REVIEW`, `READY`, `BLOCKED`, `PLANNED`, `DEFERRED`, and `CANCELLED`.

Agents must select work through [NEXT_SPRINT_PROTOCOL.md](agent-prompts/NEXT_SPRINT_PROTOCOL.md). Broad priorities, old handoffs, and conversational momentum do not override this numbered queue.

Live state used for this snapshot:

- PR #27, `docs: contractor UX research and Founder Preview experience spec`, merged on 2026-07-16 with merge commit `279bdae26e2fc1856c7cc28e6756529c0ec508e7`.
- PR #28, `feat(web): add Founder Preview needs-attention workflow`, merged on 2026-07-15 with merge commit `f03280841a11560a1761276eb2e4f0997f1e749f`.
- PR #29, `feat(ai): harden AI Estimator engine`, merged on 2026-07-15 with merge commit `10ec35ec5eb9af45eab64dde1b8390c16fb5044d`.
- PR #30, `fix(web): persist Brand Studio settings assets to real storage, not blob URLs`, is open from `fix/brand-studio-asset-upload-persistence` into `main` and owns settings asset-upload persistence work until it merges or closes.
- Active GitHub check names observed on current PRs and recent merges: `Docs consistency`, `App lint, unit tests, and build`, `App integration tests`, `Web lint and build`, `CodeQL`, `Dependency Graph`, and `Deploy database migrations`.
- A default-branch ruleset named `TradeOS Main Branch Protection` is active, targets the default branch, requires PRs, requires strict status checks, blocks deletion and non-fast-forward updates, requires linear history, and enables Copilot code review.

## Phase 1: Repository Governance And Execution System

### S001 — Canonical sprint backlog and autonomous protocol
Status: IN_REVIEW
Priority: P0
Phase: Repository governance and execution system
Dependencies: PR #24 merged
Blocked by: current docs/engineering-sprint-system PR review
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: PR #30, backend-only implementation branches
Conflicts with: other edits to docs/SPRINT_BACKLOG.md, docs/ENGINEERING_COMMAND_CENTER.md, docs/SESSION_HANDOFF.md, docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
Objective: Create the durable numbered sprint queue and autonomous next-sprint protocol.
Why this matters: Future Claude and Codex sessions need a safe way to choose work without the founder writing a bespoke prompt every time.
Verified current state: No canonical 50-sprint execution queue existed on origin/main before this branch.
Allowed paths: docs/SPRINT_BACKLOG.md, docs/ENGINEERING_COMMAND_CENTER.md, docs/ROADMAP.md, docs/SESSION_HANDOFF.md, docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md, docs/DOC_OWNERSHIP.yml, scripts/__tests__/**
Forbidden paths: app/**, web/**, packages/**, app/prisma/**, .github/workflows/**
Explicit exclusions: runtime behavior, CI behavior, branch ruleset changes, PR #30 branch contents
Implementation tasks:
1. Add the canonical 50-sprint backlog with dependency, scope, test, and stop-condition metadata.
2. Add the autonomous sprint-selection protocol and copy/paste startup prompt.
3. Add focused docs tests that validate backlog invariants.
Required tests:
- `npm run docs:test`
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- S001 through S050 exist exactly once.
- The next eligible READY sprint can be determined mechanically.
- The Command Center links to the backlog instead of duplicating it.
Documentation updates:
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/ROADMAP.md
- docs/SESSION_HANDOFF.md
- docs/DOC_OWNERSHIP.yml
Stop conditions:
- origin/main changes underneath the worktree before push.
- A new open PR appears that owns the same docs paths.
Founder decision required:
- NO
- No founder product decision is required; this is operating-system documentation.
Completion evidence:
- PR: pending docs/engineering-sprint-system PR
- Merge commit: pending
- Tests: `npm run docs:test`, `npm run docs:check -- --base origin/main`, `git diff --check`
- Notes: created from origin/main after PR #27, PR #28, and PR #29 were merged; PR #30 remained open and non-overlapping.

### S002 — Governance truth refresh and branch hygiene triage
Status: READY
Priority: P0
Phase: Repository governance and execution system
Dependencies: PR #27 merged, PR #28 merged, PR #29 merged
Blocked by: none
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: lifecycle implementation branches that do not edit governance docs
Conflicts with: active edits to docs/ENGINEERING_COMMAND_CENTER.md, docs/REPOSITORY_GOVERNANCE.md, docs/SESSION_HANDOFF.md
Objective: Refresh governance docs against live GitHub rulesets, current open PRs, recent merges, and active worktrees.
Why this matters: Agents must trust current operating docs; stale governance claims can send them into old branches or non-existent blockers.
Verified current state: Live GitHub shows an active default-branch ruleset and only PR #30 open, while older docs still mention no enforcement and multiple stale drafts.
Allowed paths: docs/ENGINEERING_COMMAND_CENTER.md, docs/REPOSITORY_GOVERNANCE.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, app/prisma/**, .github/workflows/**
Explicit exclusions: changing GitHub rulesets, closing branches, merging PRs, runtime edits
Implementation tasks:
1. Verify live ruleset, open PR, recent merge, check-name, and worktree state.
2. Update governance docs and the sprint record with verified evidence only.
3. List stale local branches/worktrees that need owner cleanup without deleting them.
Required tests:
- `npm run docs:check -- --base origin/main`
- `npm run docs:test`
- `git diff --check`
Acceptance criteria:
- Governance docs no longer contradict live GitHub state.
- PR #30 remains identified as active overlap for brand/settings work.
- No runtime files are modified.
Documentation updates:
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- GitHub API is unavailable.
- A live ruleset or PR state cannot be verified.
Founder decision required:
- NO
- This is fact refresh and triage, not policy invention.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S003 — Worktree and stale branch cleanup plan
Status: PLANNED
Priority: P1
Phase: Repository governance and execution system
Dependencies: S002
Blocked by: S002 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: non-governance implementation branches
Conflicts with: manual branch deletion or worktree cleanup happening concurrently
Objective: Produce a cleanup plan for stale local and remote branches without deleting anything automatically.
Why this matters: Old worktrees and stale branches confuse autonomous agents and increase overlap risk.
Verified current state: Multiple local worktrees exist beyond current open PR state, including old docs, security, AI, governance, and Claude worktrees.
Allowed paths: docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, .git/**, .github/workflows/**
Explicit exclusions: deleting branches, removing worktrees, force pushes
Implementation tasks:
1. Compare local worktrees, local branches, remote branches, merged PRs, and open PRs.
2. Classify each stale branch as safe-to-remove, preserve, or founder-review.
3. Update handoff with exact cleanup commands for founder approval.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Cleanup recommendations are evidence-backed and non-destructive.
- Commands use `git worktree remove` and never filesystem deletion.
Documentation updates:
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Any branch has unmerged commits whose ownership is unclear.
- GitHub state cannot be compared to local state.
Founder decision required:
- YES
- Deleting or preserving stale branches is a repository hygiene decision with possible recovery implications.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S004 — Documentation ownership low-noise audit
Status: PLANNED
Priority: P1
Phase: Repository governance and execution system
Dependencies: S002
Blocked by: S002 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: feature branches that do not edit docs/DOC_OWNERSHIP.yml
Conflicts with: docs-checker rewrites
Objective: Audit ownership rules for false positives and missing source-of-truth coverage after recent backend, web, AI, and governance merges.
Why this matters: Docs checks must catch real drift without punishing harmless edits or encouraging agents to bypass the system.
Verified current state: Ownership rules already cover module paths, controllers, middleware, workflows, and agent prompts; new sprint-system docs add another operating surface.
Allowed paths: docs/DOC_OWNERSHIP.yml, scripts/__tests__/**, docs/ENGINEERING_COMMAND_CENTER.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, .github/workflows/**
Explicit exclusions: runtime tests, CI workflow behavior changes, broad docs rewrites
Implementation tasks:
1. Review changed-file scenarios from recent PRs #27 through #30.
2. Add or adjust ownership tests only where behavior is clearly wrong.
3. Keep rules path-specific and explain every new requirement.
Required tests:
- `npm run docs:test`
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- New docs-system paths are covered.
- Existing module ownership remains intact.
- Tests describe expected ownership behavior.
Documentation updates:
- docs/DOC_OWNERSHIP.yml
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A proposed rule would require forbidden runtime edits for docs-only work.
- Ownership behavior needs a policy decision instead of a technical correction.
Founder decision required:
- NO
- Rule tuning is engineering governance unless it changes protected-branch policy.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S005 — Required-check and local validation matrix refresh
Status: PLANNED
Priority: P1
Phase: Repository governance and execution system
Dependencies: S002
Blocked by: S002 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: code branches that do not edit CI docs
Conflicts with: .github/workflows/** changes
Objective: Align docs around the exact local and GitHub verification matrix for docs, backend, frontend, integration, CodeQL, and migration deploy checks.
Why this matters: Future agents need to know which checks prove readiness and which checks are environment or deployment gates.
Verified current state: Live GitHub exposes required app, web, docs, CodeQL, and migration-related checks; a recent main push showed `Deploy database migrations` failing after PR #29 merge.
Allowed paths: docs/ENGINEERING_COMMAND_CENTER.md, docs/REPOSITORY_GOVERNANCE.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, .github/workflows/**
Explicit exclusions: changing workflow YAML, changing rulesets, bypassing failed checks
Implementation tasks:
1. Verify current workflow names and required check contexts.
2. Document which checks are PR gates versus deployment/operational signals.
3. Record any known failing operational checks as follow-up sprints, not hidden risk.
Required tests:
- `npm run docs:check -- --base origin/main`
- `npm run docs:test`
- `git diff --check`
Acceptance criteria:
- Local validation commands and CI check names are current.
- Migration deploy status is documented without blocking unrelated docs work.
Documentation updates:
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Required-check state cannot be fetched live from GitHub.
- A workflow behavior change is needed.
Founder decision required:
- NO
- This sprint refreshes documented truth and does not change enforcement.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 2: RC1 Correctness And Lifecycle Normalization

### S006 — Lifecycle compatibility inventory
Status: PLANNED
Priority: P0
Phase: RC1 correctness and lifecycle normalization
Dependencies: S005, PR #21 merged, PR #20 merged
Blocked by: S005 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: PR #30
Conflicts with: app/domain/contracts.ts lifecycle edits
Objective: Inventory every remaining stored lifecycle compatibility value and map it to the canonical display state and owning service.
Why this matters: Lifecycle drift is the named RC1 milestone risk and must be narrowed with exact evidence before implementation.
Verified current state: Project, proposal, contract, estimate, and invoice compatibility mappings remain documented in WORKFLOW_LIFECYCLES.md.
Allowed paths: docs/WORKFLOW_LIFECYCLES.md, docs/DOMAIN_MODEL.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, app/prisma/**
Explicit exclusions: migrations, service changes, UI changes
Implementation tasks:
1. Inspect contracts, services, Prisma schema, and module docs read-only.
2. Produce a canonical lifecycle inventory with owners and next implementation slices.
3. Update sprint dependencies if inventory proves sequencing needs adjustment.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Every compatibility value has one canonical target and one owning future sprint.
- No value is marked resolved without code evidence.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/DOMAIN_MODEL.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A status path is ambiguous and needs product approval.
- Runtime edits would be required to complete the inventory.
Founder decision required:
- NO
- This is a verified inventory before implementation.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S007 — Project status canonicalization
Status: PLANNED
Priority: P0
Phase: RC1 correctness and lifecycle normalization
Dependencies: S006
Blocked by: S006 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: docs-only governance branches
Conflicts with: app/domain/contracts.ts, app/modules/projects/**, web/src/app/(app)/projects/**
Objective: Reduce project status drift by making project persistence, service transitions, API responses, and workspace display agree on canonical lifecycle states.
Why this matters: A project can still appear under legacy values such as `proposal_sent` or `accepted`, undermining release confidence.
Verified current state: WORKFLOW_LIFECYCLES.md documents legacy project values normalized through `legacyProjectStatusMap`.
Allowed paths: app/domain/contracts.ts, app/modules/project-intake/**, app/backend/routes/projects.routes.ts, web/src/app/(app)/projects/**, web/src/components/projects/**, docs/**
Forbidden paths: packages/**, unrelated modules, .github/workflows/**
Explicit exclusions: redesigning the project workspace, changing job scheduling semantics
Implementation tasks:
1. Add focused tests for project status normalization and transition side effects.
2. Move service outputs and UI labels toward canonical values while preserving compatibility reads.
3. Update lifecycle and API docs with exact remaining compatibility behavior.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Legacy project statuses normalize consistently at API and UI boundaries.
- Existing project workflows still pass RLS and integration tests.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/modules/projects.md
- docs/API_REFERENCE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A migration is required before compatibility behavior is agreed.
- UI scope grows into unrelated project workspace redesign.
Founder decision required:
- NO
- Canonical lifecycle names are already documented.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S008 — Proposal declined-state normalization
Status: PLANNED
Priority: P1
Phase: RC1 correctness and lifecycle normalization
Dependencies: S007
Blocked by: S007 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: Brand Studio implementation branches that avoid proposal services
Conflicts with: app/modules/proposals/**, app/domain/contracts.ts, web/src/app/(app)/projects/**/proposals/**
Objective: Align proposal declined/rejected behavior across storage, service contracts, API responses, and portal display.
Why this matters: Proposal lifecycle drift affects customer-facing commercial workflow confidence.
Verified current state: Services still persist `rejected` while canonical docs call the display state `declined`.
Allowed paths: app/domain/contracts.ts, app/modules/proposals/**, app/backend/routes/proposals.routes.ts, web/src/app/(app)/projects/**/proposals/**, docs/**
Forbidden paths: unrelated app modules, packages/**, .github/workflows/**
Explicit exclusions: broad proposal redesign, new e-signature provider work
Implementation tasks:
1. Add tests around reject/decline API and display behavior.
2. Normalize outbound state names while retaining safe compatibility for stored values.
3. Update lifecycle, proposals, API, and portal docs.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Proposal decline behavior is canonical at boundaries.
- Existing accepted/sent/viewed transitions are unchanged.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/modules/proposals.md
- docs/API_REFERENCE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Stored-value migration becomes necessary and cannot be safely bounded.
- Customer portal behavior requires a separate larger rewrite.
Founder decision required:
- NO
- The canonical declined label is already accepted in lifecycle docs.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S009 — Contract pre-signature lifecycle normalization
Status: PLANNED
Priority: P1
Phase: RC1 correctness and lifecycle normalization
Dependencies: S008
Blocked by: S008 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: estimate-only branches
Conflicts with: app/modules/contracts/**, app/domain/contracts.ts, web contract routes
Objective: Make `pending_signature` compatibility storage render and behave consistently as the canonical contract pre-signature state.
Why this matters: Contracts are customer-facing and cannot ship with confusing pre-signature lifecycle language.
Verified current state: WORKFLOW_LIFECYCLES.md documents `pending_signature` as compatibility storage while canonical display states use `draft`, `sent`, `viewed`, `signed`, and `voided`.
Allowed paths: app/domain/contracts.ts, app/modules/contracts/**, app/backend/routes/contracts.routes.ts, web/src/app/(app)/projects/**/contracts/**, docs/**
Forbidden paths: unrelated proposal or invoice generation internals unless directly touched by contract creation tests
Explicit exclusions: adding a new signature provider, changing accepted-proposal requirement
Implementation tasks:
1. Add unit and integration tests for contract create, view, sign, and void transitions.
2. Normalize API/display state without breaking persisted compatibility values.
3. Update contract lifecycle docs and customer portal notes.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Contract pre-signature behavior is canonical at all boundaries.
- Signed and voided protections remain intact.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/modules/contracts.md
- docs/API_REFERENCE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Product decision is needed on introducing a separate `sent` persisted state.
- Scope expands into e-sign integration.
Founder decision required:
- NO
- This is compatibility cleanup within documented states.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S010 — End-to-end lifecycle regression suite
Status: PLANNED
Priority: P0
Phase: RC1 correctness and lifecycle normalization
Dependencies: S007, S008, S009
Blocked by: lifecycle normalization sprints not merged
Target branch prefix: test/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: docs-only branches
Conflicts with: concurrent lifecycle service rewrites
Objective: Add a realistic lead-to-invoice lifecycle regression suite covering project, estimate, proposal, contract, job, invoice, and portal-facing states.
Why this matters: Lifecycle correctness must be proved across the connected workflow, not only one module at a time.
Verified current state: Modules are implemented, but lifecycle normalization remains compatibility-layered and distributed.
Allowed paths: app/tests/**, web/src/**/__tests__/**, docs/WORKFLOW_LIFECYCLES.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: broad runtime rewrites, schema migrations unless a test exposes a confirmed bug
Explicit exclusions: new product states, new document providers, new payment processing
Implementation tasks:
1. Add a cross-module backend test for commercial lifecycle progression.
2. Add focused frontend tests only where state display is normalized client-side.
3. Document the exact flow now covered by regression tests.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- The canonical lifecycle path is covered by automated tests.
- Compatibility values are either absent from boundaries or explicitly asserted as normalized.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Tests reveal a lifecycle bug too large for a test-only branch.
- Integration infrastructure is unavailable.
Founder decision required:
- NO
- This sprint proves agreed lifecycle behavior.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 3: Settings, Brand Studio, And Document-Brand Consistency

### S011 — Settings asset upload persistence
Status: IN_REVIEW
Priority: P0
Phase: Settings, Brand Studio, and document-brand consistency
Dependencies: PR #27 merged
Blocked by: open PR #30
Target branch prefix: fix/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only lifecycle branches
Conflicts with: PR #30, fix/brand-studio-asset-upload-persistence, web/src/components/settings/**, web/src/app/actions/settings.ts, web/src/lib/storage.ts
Objective: Persist Settings Console brand assets as durable storage URLs instead of tab-local blob URLs.
Why this matters: Customer-facing brand assets cannot disappear after reload.
Verified current state: PR #30 is open and actively owns this fix; its checks are currently passing.
Allowed paths: web/src/components/settings/**, web/src/app/actions/settings.ts, web/src/lib/settingsAssetUpload.ts, web/src/lib/storage.ts, web/package.json, docs/CURRENT_STATE.md
Forbidden paths: app/**, packages/**, Brand Studio backend routes unless PR scope changes
Explicit exclusions: reconciling Settings and Brand Studio architecture, private-bucket signed URL support, orphan cleanup
Implementation tasks:
1. Let PR #30 complete review rather than duplicating the branch.
2. After merge, record merge evidence in this sprint.
3. Convert follow-up risks into later sprints if still valid.
Required tests:
- PR #30 test plan
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- PR #30 is merged or closed with a documented replacement path.
- No second implementation of the same asset persistence fix exists.
Documentation updates:
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- PR #30 changes scope into Brand Studio architecture.
- PR #30 fails checks and requires a separate recovery task.
Founder decision required:
- NO
- The fix is already scoped in an open PR.
Completion evidence:
- PR: https://github.com/404TradeOS-LLC/TradeOScostbook/pull/30
- Merge commit:
- Tests:
- Notes: do not duplicate until PR #30 is resolved.

### S012 — Settings and Brand Studio ownership reconciliation
Status: PLANNED
Priority: P1
Phase: Settings, Brand Studio, and document-brand consistency
Dependencies: S011
Blocked by: PR #30 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: lifecycle implementation branches
Conflicts with: Brand Studio or Settings runtime branches
Objective: Decide and document how Settings brand asset fields relate to the richer Brand Studio module before deeper wiring.
Why this matters: Two branding surfaces can confuse agents and users if ownership is not explicit.
Verified current state: PR #30 explicitly notes the mature Brand Studio module and leaves reconciliation out of scope.
Allowed paths: docs/modules/brand-studio.md, docs/modules/settings-and-operations.md, docs/CURRENT_STATE.md, docs/ARCHITECTURE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**
Explicit exclusions: schema changes, UI changes, storage behavior changes
Implementation tasks:
1. Inspect Settings and Brand Studio data flows read-only after PR #30 merges.
2. Document the canonical ownership rule for brand assets.
3. Split implementation follow-ups into narrow sprints.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Docs clearly state which surface is canonical for customer-facing document branding.
- No implementation is started before the ownership rule is documented.
Documentation updates:
- docs/modules/brand-studio.md
- docs/modules/settings-and-operations.md
- docs/CURRENT_STATE.md
- docs/ARCHITECTURE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Canonical ownership requires founder product decision.
- PR #30 has not merged.
Founder decision required:
- YES
- Brand canonical ownership affects future user-facing settings and document behavior.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S013 — Proposal document Brand Studio wiring
Status: PLANNED
Priority: P1
Phase: Settings, Brand Studio, and document-brand consistency
Dependencies: S012
Blocked by: S012 not merged
Target branch prefix: feat/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: portal-only branches
Conflicts with: app/modules/proposal-generator/**, app/modules/documents/**, app/modules/brand-studio/**
Objective: Wire proposal document rendering to the existing Brand Studio document frame without creating a second renderer.
Why this matters: Founder Preview docs identify proposal PDFs as a known brand-everywhere gap.
Verified current state: A brand-aware document frame exists in app/modules/documents, but proposal generation still needs caller integration.
Allowed paths: app/modules/proposal-generator/**, app/modules/proposals/**, app/modules/documents/**, app/modules/brand-studio/**, app/tests/**, docs/**
Forbidden paths: web design-system rewrites, unrelated invoice/contract generation
Explicit exclusions: per-document branding controls, email/SMS branding
Implementation tasks:
1. Add tests proving proposal rendering uses org Brand Studio data.
2. Reuse the existing document frame rather than building a new template system.
3. Update proposal and Brand Studio docs.
Required tests:
- `cd app && npm test`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Proposal documents render with org branding from the canonical source.
- Fallback behavior is safe when branding is incomplete.
Documentation updates:
- docs/modules/proposals.md
- docs/modules/brand-studio.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- The canonical brand source remains unresolved.
- Rendering requires broad proposal redesign.
Founder decision required:
- NO
- S012 should settle ownership before this implementation.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S014 — Invoice and contract document Brand Studio wiring
Status: PLANNED
Priority: P1
Phase: Settings, Brand Studio, and document-brand consistency
Dependencies: S013
Blocked by: S013 not merged
Target branch prefix: feat/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: non-document backend branches
Conflicts with: app/modules/invoices/**, app/modules/contracts/**, app/modules/documents/**
Objective: Extend the same Brand Studio document frame wiring to invoice and contract generation.
Why this matters: Brand-everywhere continuity must cover every customer-facing commercial document.
Verified current state: Founder Preview docs identify proposal, invoice, and contract PDFs as known unwired branding gaps.
Allowed paths: app/modules/invoices/**, app/modules/contracts/**, app/modules/documents/**, app/modules/brand-studio/**, app/tests/**, docs/**
Forbidden paths: web design-system rewrites, unrelated settings asset flows
Explicit exclusions: payment processing, e-sign provider integration, per-document branding overrides
Implementation tasks:
1. Add invoice and contract render tests for org branding.
2. Reuse the frame wiring pattern from S013.
3. Update invoice, contract, and Brand Studio docs.
Required tests:
- `cd app && npm test`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Invoice and contract documents use canonical org branding.
- Existing document lifecycle behavior remains unchanged.
Documentation updates:
- docs/modules/invoices-and-payments.md
- docs/modules/contracts.md
- docs/modules/brand-studio.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Invoice or contract renderer behavior is too divergent for one PR.
- Branding source ownership is reopened.
Founder decision required:
- NO
- This completes agreed brand wiring after S013.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S015 — Customer portal brand continuity
Status: PLANNED
Priority: P1
Phase: Settings, Brand Studio, and document-brand consistency
Dependencies: S014
Blocked by: S014 not merged
Target branch prefix: feat/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only security branches
Conflicts with: web/src/app/(app)/portal/**, docs/modules/customer-portal.md
Objective: Ensure customer portal views reflect canonical organization branding consistently with generated documents.
Why this matters: The customer portal should feel like the contractor's brand, not the software vendor's.
Verified current state: Customer portal exists, and product docs identify portal branding as part of the brand-everywhere gap.
Allowed paths: web/src/app/(app)/portal/**, web/src/components/**, web/src/lib/**, docs/modules/customer-portal.md, docs/modules/brand-studio.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/** except typed API contract fixes proven necessary, packages/**, design-system rewrites
Explicit exclusions: portal payment processing, new public auth model, portal redesign beyond brand continuity
Implementation tasks:
1. Verify current portal data path and available org branding fields.
2. Apply brand continuity using existing frontend patterns and tokens.
3. Add or update focused tests where the portal has test coverage.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Portal document views use canonical org branding.
- No blank or placeholder brand state is introduced.
Documentation updates:
- docs/modules/customer-portal.md
- docs/modules/brand-studio.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Required branding data is not exposed safely to the portal.
- Scope expands into portal workflow redesign.
Founder decision required:
- NO
- The product direction already calls for brand-everywhere continuity.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 4: Customer Portal And Document Workflow Hardening

### S016 — Portal authorization and document access audit
Status: PLANNED
Priority: P0
Phase: Customer portal and document workflow hardening
Dependencies: S010
Blocked by: S010 not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: frontend-only brand branches
Conflicts with: customer portal route rewrites
Objective: Prove customer portal document access is tenant-safe and does not leak proposal, contract, invoice, or project existence across organizations.
Why this matters: The portal is customer-facing and sits on high-risk commercial document data.
Verified current state: Customer portal document views exist, and Current State still flags portal hardening as an RC follow-through area.
Allowed paths: app/backend/routes/**, app/modules/proposals/**, app/modules/contracts/**, app/modules/invoices/**, app/tests/**, web/src/app/(app)/portal/**, docs/**
Forbidden paths: unrelated CRM or scheduling rewrites, packages/**
Explicit exclusions: new portal features, payment processing, branding work already covered by S015
Implementation tasks:
1. Audit current portal routes and backend document access paths.
2. Add tests for cross-org, missing, revoked, and expired access cases.
3. Update portal and auth/tenancy docs with verified behavior.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Cross-org portal document access is rejected without existence leaks.
- Authorized portal views continue to work.
Documentation updates:
- docs/modules/customer-portal.md
- docs/modules/auth-and-tenancy.md
- docs/API_REFERENCE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Portal auth model is ambiguous or not documented enough to test.
- Required integration infrastructure is unavailable.
Founder decision required:
- NO
- This is security proof of an existing surface.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S017 — Portal document lifecycle display hardening
Status: PLANNED
Priority: P1
Phase: Customer portal and document workflow hardening
Dependencies: S016
Blocked by: S016 not merged
Target branch prefix: fix/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only observability branches
Conflicts with: web/src/app/(app)/portal/**
Objective: Make proposal, contract, invoice, and project status display in the portal match canonical lifecycle labels.
Why this matters: Customer-facing lifecycle drift creates confusion and support burden.
Verified current state: Portal exists, and lifecycle normalization remains the current milestone.
Allowed paths: web/src/app/(app)/portal/**, web/src/components/**, web/src/lib/**, docs/modules/customer-portal.md, docs/WORKFLOW_LIFECYCLES.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/** except contract/type fixes proven necessary, packages/**
Explicit exclusions: new portal interactions, payments, e-sign provider work
Implementation tasks:
1. Audit portal labels against WORKFLOW_LIFECYCLES.md.
2. Normalize portal display and empty/error states.
3. Add focused rendering tests if the route supports them.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Portal labels match canonical lifecycle docs.
- No legacy status appears to customers unless explicitly intentional.
Documentation updates:
- docs/modules/customer-portal.md
- docs/WORKFLOW_LIFECYCLES.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Backend API returns insufficient normalized state.
- Scope expands into new portal workflow design.
Founder decision required:
- NO
- This follows the lifecycle normalization milestone.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S018 — Document delivery history review
Status: PLANNED
Priority: P1
Phase: Customer portal and document workflow hardening
Dependencies: S017
Blocked by: S017 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only non-document branches
Conflicts with: app/modules/proposals/**, app/modules/contracts/**, app/modules/invoices/**
Objective: Verify proposal, contract, and invoice delivery histories are created, scoped, displayed, and documented consistently.
Why this matters: Delivery history is part of commercial auditability and customer support.
Verified current state: Recent migrations added proposal delivery tracking and invoice/contract history.
Allowed paths: app/modules/proposals/**, app/modules/contracts/**, app/modules/invoices/**, app/tests/**, docs/modules/proposals.md, docs/modules/contracts.md, docs/modules/invoices-and-payments.md, docs/SPRINT_BACKLOG.md
Forbidden paths: web redesign, new communication providers, packages/**
Explicit exclusions: real email/SMS delivery integration, payment provider integration
Implementation tasks:
1. Audit service writes and reads for each delivery/history model.
2. Add tests for org scope, actor attribution, and lifecycle event order.
3. Document exact current delivery-history semantics and limitations.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Delivery/history events are tenant-scoped and test-covered.
- Docs do not overstate real external delivery provider behavior.
Documentation updates:
- docs/modules/proposals.md
- docs/modules/contracts.md
- docs/modules/invoices-and-payments.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Delivery model lacks necessary fields for auditability and needs schema design.
- External provider behavior is required.
Founder decision required:
- NO
- This sprint verifies existing delivery-history infrastructure.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S019 — Portal no-blank-screen and placeholder cleanup
Status: PLANNED
Priority: P1
Phase: Customer portal and document workflow hardening
Dependencies: S017
Blocked by: S017 not merged
Target branch prefix: fix/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only tests
Conflicts with: portal redesign branches
Objective: Remove or replace customer-visible placeholder and blank states in portal routes with truthful, actionable states.
Why this matters: Founder Preview docs make no blank primary screens and no fake placeholders hard requirements.
Verified current state: Product docs require no blank screens; Current State still tracks portal hardening as RC work.
Allowed paths: web/src/app/(app)/portal/**, web/src/components/**, docs/modules/customer-portal.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/** unless a missing API error state is proven, packages/**
Explicit exclusions: adding new portal features, marketing copy, broad redesign
Implementation tasks:
1. Inspect portal loading, empty, unauthorized, and error states.
2. Replace placeholders with truthful copy and next actions.
3. Verify mobile and desktop builds still pass.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Portal primary routes do not show lorem ipsum, fake metrics, or dead placeholders.
- Empty states are truthful and action-oriented.
Documentation updates:
- docs/modules/customer-portal.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Fix requires new backend capability.
- Copy requires founder approval for customer-facing legal/commercial language.
Founder decision required:
- NO
- The no-placeholder requirement is already documented.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S020 — Portal release regression suite
Status: PLANNED
Priority: P1
Phase: Customer portal and document workflow hardening
Dependencies: S016, S017, S018, S019
Blocked by: portal hardening sprints not merged
Target branch prefix: test/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only observability branches
Conflicts with: active portal implementation branches
Objective: Add a release regression suite for portal document visibility, lifecycle display, branded rendering, and no-blank-state behavior.
Why this matters: Customer portal hardening needs lasting tests, not one-off manual confidence.
Verified current state: Portal exists but release-hardening follow-through remains tracked.
Allowed paths: web/src/**/__tests__/**, web/src/app/(app)/portal/**, app/tests/**, docs/modules/customer-portal.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: unrelated app modules, unrelated web routes, packages/**
Explicit exclusions: new portal features or providers
Implementation tasks:
1. Add focused portal regression tests around the hardened paths.
2. Add backend tests only where access control is not already covered.
3. Document the regression coverage.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `cd app && npm test`
- `cd app && npm run test:integration`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Portal release-hardening behaviors are covered by automated checks.
- Tests do not rely on fake cross-tenant shortcuts.
Documentation updates:
- docs/modules/customer-portal.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Required test harness support does not exist and would become a larger framework task.
- Integration infrastructure is unavailable.
Founder decision required:
- NO
- This locks in completed hardening behavior.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 5: Estimating And AI-Assist Production Hardening

### S021 — AI estimator draft retention decision
Status: BLOCKED
Priority: P1
Phase: Estimating and AI-assist production hardening
Dependencies: PR #29 merged
Blocked by: founder retention/privacy decision
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: non-AI implementation branches
Conflicts with: app/modules/ai-estimate-assist/**
Objective: Decide whether reviewed AI drafts should persist a draft-run record and what prompt/provenance data may be stored.
Why this matters: PR #29 intentionally avoided storing full contractor prompts; changing that affects privacy, auditability, and storage policy.
Verified current state: AI estimator apply uses signed review tokens and source keys, but docs note no full draft-run record is persisted.
Allowed paths: docs/modules/ai-estimate-assist.md, docs/ARCHITECTURE.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**
Explicit exclusions: implementing draft-run persistence before a decision, storing full sensitive prompts by default
Implementation tasks:
1. Present retention options and tradeoffs.
2. Record the chosen policy in AI-assist docs.
3. Create follow-up implementation sprint only if policy allows persistence.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Retention policy is explicit.
- AI docs do not imply persisted draft-run records unless implemented.
Documentation updates:
- docs/modules/ai-estimate-assist.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Founder does not choose a retention path.
- Legal/privacy review is required.
Founder decision required:
- YES
- The decision affects whether sensitive contractor prompt text is stored.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S022 — AI assist provenance UI review
Status: PLANNED
Priority: P1
Phase: Estimating and AI-assist production hardening
Dependencies: PR #29 merged, PR #28 merged
Blocked by: S010 not merged
Target branch prefix: feat/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only performance branches
Conflicts with: web/src/components/estimate-assist/**, app/modules/ai-estimate-assist/**
Objective: Surface deterministic match provenance clearly in the existing AI Estimate Assist review panel.
Why this matters: Product docs identify explainable AI assist as a strong near-term differentiator; generated text must remain advisory and review-first.
Verified current state: PR #29 hardened backend provenance and PR #28 surfaced match method in the review panel; deeper plain-English provenance remains a bounded UI follow-up.
Allowed paths: web/src/components/estimate-assist/**, web/src/app/(app)/projects/**/estimates/**, docs/modules/ai-estimate-assist.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new AI backend architecture, autonomous writes, packages/**
Explicit exclusions: external model API integration, RAG, photo upload, voice capture
Implementation tasks:
1. Inspect existing backend response fields before changing contracts.
2. Add concise provenance display without trusting generated text for identity or pricing.
3. Update AI assist docs and product-state notes.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Users can see why a suggestion matched.
- No new autonomous AI write path is introduced.
Documentation updates:
- docs/modules/ai-estimate-assist.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Existing API lacks enough deterministic provenance for a truthful UI.
- Scope expands into new AI architecture.
Founder decision required:
- NO
- Review-first explainability is already in product direction.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S023 — Cost item and assembly code-search performance indexes
Status: PLANNED
Priority: P1
Phase: Estimating and AI-assist production hardening
Dependencies: S005
Blocked by: S005 not merged
Target branch prefix: perf/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only portal branches
Conflicts with: app/prisma/migrations/**, app/modules/cost-database/**, app/modules/assemblies-database/**
Objective: Add measured trigram coverage for cost-item and assembly `code` substring search if query plans still prove scan-heavy.
Why this matters: Current docs identify mixed name-or-code search as a remaining performance risk.
Verified current state: Migration `20260703090000_add_search_trgm_indexes` covers `name` columns, not `code` columns.
Allowed paths: app/prisma/migrations/**, app/prisma/schema.prisma, app/modules/cost-database/**, app/modules/assemblies-database/**, app/tests/**, docs/modules/cost-book.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: unrelated schema tables, packages/**, web/**
Explicit exclusions: changing search semantics without evidence, broad search service rewrite
Implementation tasks:
1. Capture current query plans for representative name-or-code searches.
2. Add the smallest safe migration only if plans prove the need.
3. Add integration or regression coverage and document rollout considerations.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Code-search performance risk is either fixed with evidence or documented as not reproducible.
- RLS behavior remains unchanged.
Documentation updates:
- docs/modules/cost-book.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Query-plan evidence is unavailable.
- Migration rollout risk requires production DBA review.
Founder decision required:
- NO
- This is measured performance hardening for a documented debt item.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S024 — Estimate line ordering and duplicate-write race hardening
Status: PLANNED
Priority: P1
Phase: Estimating and AI-assist production hardening
Dependencies: PR #29 merged, S010
Blocked by: S010 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only AI provenance branches
Conflicts with: app/modules/estimate-engine/**, app/prisma/schema.prisma
Objective: Review and harden manual estimate line ordering under close concurrent submissions.
Why this matters: PR #29 documented broader manual line-item sort-order races as outside the AI hardening sprint.
Verified current state: AI-reviewed lines have source-key duplicate protection, but ordinary manual line ordering still needs a dedicated concurrency review.
Allowed paths: app/modules/estimate-engine/**, app/tests/**, app/prisma/migrations/**, app/prisma/schema.prisma, docs/modules/estimating.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: AI estimator architecture, web redesign, packages/**
Explicit exclusions: replacing the estimate engine, changing pricing formulas
Implementation tasks:
1. Add concurrent add-line tests that reproduce or rule out ordering races.
2. Implement the smallest locking or ordering fix consistent with existing patterns.
3. Document remaining behavior and retry semantics.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Concurrent manual line additions have deterministic behavior.
- AI source-key protection remains intact.
Documentation updates:
- docs/modules/estimating.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Fix requires a broad estimate-engine redesign.
- Migration design is needed but not safely bounded.
Founder decision required:
- NO
- This is correctness hardening of existing estimate behavior.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S025 — Estimating and AI production regression matrix
Status: PLANNED
Priority: P1
Phase: Estimating and AI-assist production hardening
Dependencies: S022, S023, S024
Blocked by: estimating hardening sprints not merged
Target branch prefix: test/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: docs-only branches
Conflicts with: active estimating implementation branches
Objective: Consolidate the production regression matrix for estimating, costbook, assemblies, AI draft, reviewed apply, retries, and lifecycle locks.
Why this matters: Estimating is a core commercial workflow and needs a durable proof set before RC stabilization.
Verified current state: AI estimator and estimate-engine tests exist, but follow-up hardening sprints may add new edge behavior.
Allowed paths: app/tests/**, docs/modules/estimating.md, docs/modules/ai-estimate-assist.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: runtime code except fixes for test-discovered defects, web/**, packages/**
Explicit exclusions: new AI architecture, new pricing engine
Implementation tasks:
1. Inventory estimating and AI edge cases covered by tests.
2. Add missing focused tests around retry, stale data, lifecycle locks, pricing authority, and cross-org access.
3. Update docs with the tested production matrix.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- The estimating regression matrix is explicit and passing.
- Gaps are either fixed or recorded as future sprints.
Documentation updates:
- docs/modules/estimating.md
- docs/modules/ai-estimate-assist.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A discovered defect requires a separate implementation branch.
- Integration infrastructure is unavailable.
Founder decision required:
- NO
- This locks in agreed estimating behavior.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 6: Scheduling, Dispatch, And Field-Work Stabilization

### S026 — Scheduling conflict edge-case coverage
Status: PLANNED
Priority: P1
Phase: Scheduling, dispatch, and field-work stabilization
Dependencies: S010, PR #20 merged
Blocked by: S010 not merged
Target branch prefix: test/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only branding branches
Conflicts with: app/modules/jobs/**
Objective: Expand job scheduling tests around overlaps, privileged overrides, technician assignments, and reopening completed jobs.
Why this matters: Job scheduling is implemented baseline and must be stable before dispatch UX polish.
Verified current state: Jobs and scheduling engine is merged via PR #20 with RLS coverage and documented override rules.
Allowed paths: app/modules/jobs/**, app/tests/**, docs/modules/jobs-and-scheduling.md, docs/WORKFLOW_LIFECYCLES.md, docs/SPRINT_BACKLOG.md
Forbidden paths: route optimization, fleet routing, automated dispatch intelligence, packages/**
Explicit exclusions: advanced optimization, new scheduling UI
Implementation tasks:
1. Add edge-case unit and integration tests for scheduling constraints.
2. Fix narrowly scoped defects exposed by tests.
3. Document confirmed override behavior.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Conflict, override, assignment, and reopen behavior is test-covered.
- No route optimization is introduced.
Documentation updates:
- docs/modules/jobs-and-scheduling.md
- docs/WORKFLOW_LIFECYCLES.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A scheduler domain rule is ambiguous.
- Tests require unavailable live infrastructure.
Founder decision required:
- NO
- Current override rules are already documented.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S027 — Dispatcher workload coordination hardening
Status: PLANNED
Priority: P1
Phase: Scheduling, dispatch, and field-work stabilization
Dependencies: S026
Blocked by: S026 not merged
Target branch prefix: feat/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only estimating branches
Conflicts with: web scheduling/dispatch routes and job service changes
Objective: Harden the existing dispatcher-managed workload coordination surface without introducing automated routing.
Why this matters: Dispatchers need reliable assignment and workload coordination inside current RBAC limits.
Verified current state: Command Center says dispatcher workflows are in scope today, while advanced optimization and route-planning remain excluded.
Allowed paths: web/src/app/(app)/**, web/src/components/**, web/src/lib/**, app/modules/jobs/**, docs/modules/jobs-and-scheduling.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: route optimization, fleet routing, automatic technician-routing decisions, packages/**
Explicit exclusions: new dispatch backend architecture, map-routing intelligence
Implementation tasks:
1. Identify the current dispatcher entry points and gaps.
2. Improve assignment/status workflows using existing job APIs.
3. Add focused tests or build coverage where practical.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `cd app && npm test`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Dispatcher workflows are clearer and remain permission-aware.
- No automated routing or optimization claim is introduced.
Documentation updates:
- docs/modules/jobs-and-scheduling.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Work requires new route optimization product decisions.
- Scope becomes a broad dashboard redesign.
Founder decision required:
- NO
- This stabilizes current dispatcher scope.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S028 — Technician assigned-work cockpit
Status: PLANNED
Priority: P2
Phase: Scheduling, dispatch, and field-work stabilization
Dependencies: S027
Blocked by: S027 not merged
Target branch prefix: feat/
Recommended worktree type: frontend
Primary owner: frontend
Parallel-safe with: backend-only security branches
Conflicts with: role-specific navigation or app-shell branches
Objective: Build a reduced technician home surface for today's assigned jobs using existing job and membership data.
Why this matters: Product docs identify role-specific cockpits as a near-term UX advantage, and technicians should not see an owner/admin-first workspace.
Verified current state: Role data exists, but Founder Preview docs state technician-specific reduced navigation is new work.
Allowed paths: web/src/app/(app)/**, web/src/components/**, web/src/lib/**, app/modules/jobs/**, docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md, docs/modules/jobs-and-scheduling.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new mobile app, voice infrastructure, route optimization, packages/**
Explicit exclusions: owner/admin command center redesign, broad navigation rewrite beyond role gating
Implementation tasks:
1. Define the smallest technician landing surface using current assigned jobs.
2. Reuse existing auth and job APIs.
3. Verify owner/admin navigation remains unchanged.
Required tests:
- `cd web && npm run lint`
- `cd web && npm run build`
- `cd app && npm test`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Technician users can see today's assigned work without unrelated admin surfaces.
- Permission boundaries are preserved.
Documentation updates:
- docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md
- docs/modules/jobs-and-scheduling.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Role routing design needs founder approval.
- Work turns into a full mobile app redesign.
Founder decision required:
- NO
- Product docs already call for a reduced technician surface.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S029 — Job completion to invoice-readiness hardening
Status: PLANNED
Priority: P1
Phase: Scheduling, dispatch, and field-work stabilization
Dependencies: S026, S010
Blocked by: S026 and S010 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only technician surface work
Conflicts with: job lifecycle or invoice service branches
Objective: Verify and harden the handoff from completed field work to ready-to-invoice workflows.
Why this matters: The owner command center and Founder Preview depend on accurate ready-to-invoice signals.
Verified current state: Jobs, invoices, and project tasks exist, and PR #28 added needs-attention workflow surfaces from current data.
Allowed paths: app/modules/jobs/**, app/modules/invoices/**, app/modules/projects/**, app/tests/**, web/src/components/dashboard/**, docs/modules/jobs-and-scheduling.md, docs/modules/invoices-and-payments.md, docs/SPRINT_BACKLOG.md
Forbidden paths: payment processing, route optimization, packages/**
Explicit exclusions: automatic invoice sending without review, accounting integration
Implementation tasks:
1. Audit current ready-to-invoice derivation.
2. Add tests for completed jobs feeding invoice readiness without cross-org leaks.
3. Fix narrowly scoped gaps and document behavior.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Completed field work produces reliable invoice-readiness signals.
- Invoices remain review-first unless existing behavior says otherwise.
Documentation updates:
- docs/modules/jobs-and-scheduling.md
- docs/modules/invoices-and-payments.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Product decision is needed on automatic invoice creation.
- Accounting or payment provider integration becomes required.
Founder decision required:
- NO
- This hardens existing job/invoice relationships.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S030 — Field-work activity and audit timeline coverage
Status: PLANNED
Priority: P2
Phase: Scheduling, dispatch, and field-work stabilization
Dependencies: S026
Blocked by: S026 not merged
Target branch prefix: test/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only dispatch branches
Conflicts with: activity service rewrites
Objective: Ensure scheduling, assignment, dispatch, travel, on-site, paused, completed, cancelled, and reopened events produce useful activity/audit records where appropriate.
Why this matters: Field operations need trustworthy timeline evidence for support and customer communication.
Verified current state: Activity and intelligence primitives exist, and jobs own assignments and status transitions.
Allowed paths: app/modules/jobs/**, app/modules/intelligence/**, app/tests/**, docs/modules/jobs-and-scheduling.md, docs/modules/activity-and-intelligence.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new notification system, external messaging providers, packages/**
Explicit exclusions: analytics dashboards, route tracking, GPS fleet tracking
Implementation tasks:
1. Inventory current activity emission for job changes.
2. Add missing focused tests and minimal event writes where justified.
3. Document actor, org, entity, and event metadata.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Important field-work changes are auditable.
- No secrets or excessive free-text payloads are logged.
Documentation updates:
- docs/modules/jobs-and-scheduling.md
- docs/modules/activity-and-intelligence.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Event taxonomy needs a product decision.
- Logging risks sensitive field notes.
Founder decision required:
- NO
- This is observability for existing workflows.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 7: Performance, Observability, And Database Reliability

### S031 — Query-plan and slow-path inventory
Status: PLANNED
Priority: P1
Phase: Performance, observability, and database reliability
Dependencies: S005
Blocked by: S005 not merged
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: frontend-only branches
Conflicts with: performance migration branches
Objective: Inventory the highest-risk query paths and identify which need indexes, batching, or service-level changes.
Why this matters: Production readiness requires knowing where performance risk lives before tables grow.
Verified current state: Trigram name indexes exist; code substring search remains documented as a possible scan-heavy path.
Allowed paths: docs/ARCHITECTURE.md, docs/CURRENT_STATE.md, docs/modules/cost-book.md, docs/modules/activity-and-intelligence.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, app/prisma/**
Explicit exclusions: adding indexes or changing queries in this docs-only sprint
Implementation tasks:
1. Inspect current services and known query risks read-only.
2. Rank query-path follow-ups by user impact and evidence.
3. Update sprint dependencies for performance work.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Performance work is evidence-ranked, not speculative.
- Implementation follow-ups remain narrow and testable.
Documentation updates:
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Query evidence requires production data unavailable to the repo.
- A migration is needed immediately.
Founder decision required:
- NO
- This is a technical inventory.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S032 — Activity and notification observability review
Status: PLANNED
Priority: P2
Phase: Performance, observability, and database reliability
Dependencies: S031
Blocked by: S031 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only portal branches
Conflicts with: activity/intelligence service branches
Objective: Verify activity, notification, recent-item, saved-view, and feature-flag primitives emit enough metadata for operational debugging.
Why this matters: Once users rely on TradeOS daily, missing event context slows support and incident response.
Verified current state: Activity and intelligence primitives are implemented and documented as shared surfaces.
Allowed paths: app/modules/intelligence/**, app/tests/**, docs/modules/activity-and-intelligence.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: unrelated product modules, external observability vendors, packages/**
Explicit exclusions: adding a BI dashboard, logging sensitive prompts or secrets
Implementation tasks:
1. Audit emitted metadata and tests.
2. Add missing tests or small metadata fixes.
3. Document what is and is not captured.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Core activity/intelligence events are support-useful and tenant-safe.
- Docs do not claim analytics capabilities that do not exist.
Documentation updates:
- docs/modules/activity-and-intelligence.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Observability needs external vendor selection.
- Event payloads risk sensitive data exposure.
Founder decision required:
- NO
- This hardens existing telemetry primitives.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S033 — Integration harness reliability and prerequisite proof
Status: PLANNED
Priority: P1
Phase: Performance, observability, and database reliability
Dependencies: S005
Blocked by: S005 not merged
Target branch prefix: test/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: docs-only branches
Conflicts with: app/scripts/test-integration-db.sh rewrites
Objective: Make integration-test prerequisites and failure modes clear, reproducible, and non-misleading.
Why this matters: Agents repeatedly hit Docker or psql blockers; failures must be classified as environment or app regressions correctly.
Verified current state: AGENTS.md notes integration tests require `psql`, while recent AI work proved Docker-backed integration can pass when Docker is available.
Allowed paths: app/scripts/test-integration-db.sh, app/tests/**, app/README.md, docs/DEPLOYMENT_GUIDE.md, docs/REPOSITORY_GOVERNANCE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: application runtime behavior, Prisma schema unless a harness bug requires it, web/**
Explicit exclusions: replacing the integration harness, adding a new database provider
Implementation tasks:
1. Audit harness prerequisite checks for Docker and psql.
2. Improve failure messages or docs where blockers are ambiguous.
3. Add tests only if script behavior is testable without Docker.
Required tests:
- `cd app && npm run test:integration`
- `cd app && npm test`
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Environment blockers are reported with exact actionable messages.
- Integration harness remains the authoritative RLS proof path.
Documentation updates:
- app/README.md
- docs/DEPLOYMENT_GUIDE.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Docker is unavailable for final validation.
- Harness changes require CI workflow edits.
Founder decision required:
- NO
- This is reliability hardening of existing test infrastructure.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S034 — Background job and scheduler observability
Status: PLANNED
Priority: P2
Phase: Performance, observability, and database reliability
Dependencies: S032
Blocked by: S032 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only branches
Conflicts with: supplier integration worker branches
Objective: Ensure background sessions and scheduled supplier-review plumbing log actor/source, org, and result safely.
Why this matters: Background jobs operate outside HTTP requests and need clear tenancy and failure evidence.
Verified current state: Supplier review queue and scheduler plumbing exist; live feed ingestion remains stubbed.
Allowed paths: app/modules/supplier-integration/**, app/db/requestSession.ts, app/tests/**, docs/modules/settings-and-operations.md, docs/modules/auth-and-tenancy.md, docs/SPRINT_BACKLOG.md
Forbidden paths: live supplier connector implementation, external API credentials, packages/**
Explicit exclusions: new supplier feed provider, scheduler infrastructure outside current repo
Implementation tasks:
1. Audit background-session metadata and worker activity logging.
2. Add focused tests for tenant-safe job execution and failure records.
3. Document safe operational signals.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Background job runs are tenant-scoped and diagnosable.
- No secrets or API keys are logged.
Documentation updates:
- docs/modules/settings-and-operations.md
- docs/modules/auth-and-tenancy.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Work requires choosing a live supplier provider.
- Scheduler behavior depends on unavailable production infrastructure.
Founder decision required:
- NO
- This hardens current worker plumbing.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S035 — Migration deploy failure triage
Status: PLANNED
Priority: P0
Phase: Performance, observability, and database reliability
Dependencies: S005
Blocked by: S005 not merged
Target branch prefix: fix/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: frontend-only branches
Conflicts with: .github/workflows/deploy-migrations.yml, app/prisma/migrations/**
Objective: Investigate the recent `Deploy database migrations` failure on main and determine whether it is environment, secret, migration, or workflow related.
Why this matters: A failing migration deploy signal is production-readiness debt even when PR verification is green.
Verified current state: GitHub runs show `Deploy database migrations` failed on the main push for PR #29 while `Verify repository` succeeded.
Allowed paths: docs/SESSION_HANDOFF.md, docs/DEPLOYMENT_GUIDE.md, docs/REPOSITORY_GOVERNANCE.md, docs/SPRINT_BACKLOG.md, .github/workflows/deploy-migrations.yml, app/scripts/**, app/prisma/migrations/**
Forbidden paths: unrelated app modules, web/**, packages/**
Explicit exclusions: production secret changes in repo, destructive database commands
Implementation tasks:
1. Inspect failing GitHub run logs and current workflow configuration.
2. Classify the failure and implement the smallest safe fix if it is repo-owned.
3. Document any environment-only blocker exactly.
Required tests:
- relevant workflow/script validation
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- The failure is either fixed or documented with the exact external blocker.
- No migration deployment claim remains ambiguous.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- GitHub logs are inaccessible.
- Fix requires production credentials or admin UI changes.
Founder decision required:
- NO
- Investigation is technical; secret or environment changes may become a separate founder task.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 8: Security, Tenancy, RLS, And Auditability

### S036 — RLS coverage audit
Status: PLANNED
Priority: P0
Phase: Security, tenancy, RLS, and auditability
Dependencies: S010, S033
Blocked by: lifecycle and integration harness dependencies not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: frontend-only polish branches
Conflicts with: app/prisma/schema.prisma, app/tests/rls.integration.ts
Objective: Audit live RLS coverage across implemented tenant-owned tables and identify missing integration tests.
Why this matters: RLS is forced and app-side filtering is defense-in-depth, not the primary control.
Verified current state: app/tests/rls.integration.ts covers many modules, including recent AI source-key migration and job scheduling surfaces.
Allowed paths: app/prisma/schema.prisma, app/prisma/migrations/**, app/tests/rls.integration.ts, docs/modules/auth-and-tenancy.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: web/**, packages/**, unrelated feature work
Explicit exclusions: replacing RLS with app-only filtering, broad auth redesign
Implementation tasks:
1. Compare schema tenant-owned tables against RLS policies and integration tests.
2. Add missing RLS tests or document already-covered relationships.
3. Fix narrowly scoped RLS gaps if found.
Required tests:
- `cd app && npm run test:integration`
- `cd app && npm test`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Every tenant-owned table is accounted for by policy and test evidence or a tracked follow-up.
- Cross-org access failures do not leak record existence.
Documentation updates:
- docs/modules/auth-and-tenancy.md
- docs/DOMAIN_MODEL.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Integration database is unavailable.
- A serious RLS gap requires immediate isolated fix.
Founder decision required:
- NO
- This is core security verification.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S037 — Audit logging coverage for customer and estimate mutations
Status: PLANNED
Priority: P1
Phase: Security, tenancy, RLS, and auditability
Dependencies: S036
Blocked by: S036 not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: frontend-only portal branches
Conflicts with: activity service branches
Objective: Ensure customer, project, estimate, proposal, contract, invoice, and job mutations that matter for support emit useful activity/audit events.
Why this matters: Commercial systems need actor, organization, entity, and outcome evidence for critical mutations.
Verified current state: Activity primitives exist, but module-level coverage should be audited and filled deliberately.
Allowed paths: app/modules/**, app/tests/**, docs/modules/activity-and-intelligence.md, docs/modules/auth-and-tenancy.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: secrets logging, full prompt logging, packages/**
Explicit exclusions: external audit vendor, analytics dashboard
Implementation tasks:
1. Inventory mutation paths and current activity emission.
2. Add missing audit events for high-value mutations.
3. Add tests that assert actor/org/entity metadata without sensitive payloads.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Critical mutations are auditable and tenant-safe.
- Sensitive prompts, secrets, and unnecessary customer free text are not logged.
Documentation updates:
- docs/modules/activity-and-intelligence.md
- docs/modules/auth-and-tenancy.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Event taxonomy requires a product/security decision.
- Logging would expose sensitive data.
Founder decision required:
- NO
- This is auditability hardening within existing activity primitives.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S038 — Invite and membership hardening review
Status: PLANNED
Priority: P1
Phase: Security, tenancy, RLS, and auditability
Dependencies: S036
Blocked by: S036 not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: frontend-only brand branches
Conflicts with: app/modules/auth/**, app/backend/controllers/auth.controller.ts
Objective: Review invite, membership, role normalization, and account provisioning flows for RC1 security and product-document accuracy.
Why this matters: Membership resolution is one of the three layers every authenticated request depends on.
Verified current state: Product docs state invites are currently limited to dispatcher and technician roles, while owner/admin signup follows organization provisioning.
Allowed paths: app/modules/auth/**, app/backend/controllers/auth.controller.ts, app/backend/routes/auth.routes.ts, app/tests/**, docs/modules/auth-and-tenancy.md, docs/RBAC_MATRIX.md, docs/product/TRADEOS_OWNER_EXPERIENCE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new phone invite channel, new owner/admin invite product surface unless separately approved
Explicit exclusions: TOTP implementation, OAuth provider work
Implementation tasks:
1. Audit invite role validation and membership activation behavior.
2. Add tests for unsupported invite roles and cross-org invite boundaries.
3. Update docs to match verified behavior.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Invite behavior is permission-safe and documented.
- Unsupported owner/admin or phone-invite behavior is not implied as implemented.
Documentation updates:
- docs/modules/auth-and-tenancy.md
- docs/RBAC_MATRIX.md
- docs/product/TRADEOS_OWNER_EXPERIENCE.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Founder wants to expand invite roles in the same sprint.
- MFA/TOTP scope becomes required.
Founder decision required:
- NO
- This reviews current invite behavior without expanding product scope.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S039 — Rate-limit and input-bound coverage audit
Status: PLANNED
Priority: P1
Phase: Security, tenancy, RLS, and auditability
Dependencies: S036
Blocked by: S036 not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: frontend-only branches
Conflicts with: app/backend/server.ts, app/backend/middleware/**
Objective: Audit public and authenticated mutation endpoints for payload bounds, rate limits, and validation consistency.
Why this matters: Recent AI hardening reused existing rate-limit patterns; the same discipline should cover other high-risk endpoints.
Verified current state: Auth/provisioning and AI estimator rate limiting exist; controllers generally own Zod validation.
Allowed paths: app/backend/middleware/**, app/backend/controllers/**, app/backend/routes/**, app/modules/**, app/tests/**, docs/API_REFERENCE.md, docs/modules/auth-and-tenancy.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new rate-limit subsystem, dependency upgrades, packages/**
Explicit exclusions: replacing validation framework, broad server rewrite
Implementation tasks:
1. Inventory high-risk endpoint validation and rate-limit coverage.
2. Add focused bounds/rate-limit tests where missing.
3. Document current middleware pattern and remaining exceptions.
Required tests:
- `cd app && npm test`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- High-risk endpoints have explicit validation bounds and appropriate rate-limit posture.
- No second rate-limit system is created.
Documentation updates:
- docs/API_REFERENCE.md
- docs/modules/auth-and-tenancy.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Endpoint ownership is ambiguous.
- Fix requires infrastructure-level WAF or edge controls.
Founder decision required:
- NO
- This is backend security hygiene.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S040 — Production security header and session review
Status: PLANNED
Priority: P1
Phase: Security, tenancy, RLS, and auditability
Dependencies: S039
Blocked by: S039 not merged
Target branch prefix: security/
Recommended worktree type: backend
Primary owner: security
Parallel-safe with: docs-only branches
Conflicts with: auth/session middleware branches
Objective: Review production security headers, trust-proxy, HSTS, cookie/session behavior, CSRF posture, and browser proxy assumptions.
Why this matters: Production hardening already exists, but RC1 should verify the deployed assumptions still match code and docs.
Verified current state: AGENTS.md documents centralized security headers, trust-proxy, HSTS, auth rate limiting, and httpOnly web sessions.
Allowed paths: app/backend/server.ts, app/backend/middleware/**, web/src/app/api/proxy/**, web/src/lib/**, app/tests/**, docs/DEPLOYMENT_GUIDE.md, docs/ARCHITECTURE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: new auth provider, dependency upgrades unless required for a confirmed vulnerability, packages/**
Explicit exclusions: replacing Supabase session path, OAuth redesign
Implementation tasks:
1. Audit current security middleware and browser proxy behavior.
2. Add tests or documentation for production-only assumptions.
3. Fix narrowly scoped misconfiguration if found.
Required tests:
- `cd app && npm test`
- `cd app && npm run lint`
- `cd app && npm run build`
- `cd web && npm run lint`
- `cd web && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Security middleware and cookie/session posture are verified and documented.
- Browser token handling assumptions remain safe.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/ARCHITECTURE.md
- docs/modules/auth-and-tenancy.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- A vulnerability is found that requires immediate isolated fix.
- Production environment settings cannot be verified.
Founder decision required:
- NO
- This is security review of existing production posture.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 9: Production Deployment And Operational Readiness

### S041 — Production environment approval verification
Status: BLOCKED
Priority: P0
Phase: Production deployment and operational readiness
Dependencies: S005
Blocked by: repository/admin environment access
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: code branches that do not change deployment workflows
Conflicts with: deployment workflow branches
Objective: Verify real production environment approvals, secrets, migration rollout posture, and deployment gates outside tracked code.
Why this matters: Deployment confidence cannot be inferred from repository files alone.
Verified current state: Command Center and Current State say production deployment state and environment approvals must be verified per environment.
Allowed paths: docs/DEPLOYMENT_GUIDE.md, docs/REPOSITORY_GOVERNANCE.md, docs/ENGINEERING_COMMAND_CENTER.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, .github/workflows/**
Explicit exclusions: changing secrets, changing GitHub environment settings, deploying production
Implementation tasks:
1. Inspect GitHub environment and approval settings with adequate access.
2. Record verified production/deploy gates and any gaps.
3. Create implementation sprints for repo-owned fixes only.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Environment approval posture is verified or blocker is exact.
- Docs separate code-readiness from production environment readiness.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- GitHub admin/environment access is unavailable.
- A production settings change is required.
Founder decision required:
- YES
- This needs repository/admin visibility and possibly environment policy choices.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S042 — Migration rollout runbook and rollback rehearsal
Status: PLANNED
Priority: P1
Phase: Production deployment and operational readiness
Dependencies: S035, S041
Blocked by: migration deploy triage and environment verification not complete
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: frontend-only branches
Conflicts with: deploy workflow changes
Objective: Document the exact production migration deploy and rollback/recovery runbook.
Why this matters: Schema changes are routine in TradeOS, and production rollout steps need a trusted playbook.
Verified current state: Deploy migrations workflow exists, but recent failure requires triage before runbook confidence.
Allowed paths: docs/DEPLOYMENT_GUIDE.md, docs/REPOSITORY_GOVERNANCE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, .github/workflows/**, packages/**
Explicit exclusions: changing deployment automation, running production migrations
Implementation tasks:
1. Verify the intended migration deploy flow after S035 and S041.
2. Write rollback/recovery decision points and owner responsibilities.
3. Document environment blockers separately from code blockers.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- A human can follow the runbook without guessing.
- Rollback language is honest about what can and cannot be undone automatically.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Deploy workflow behavior is still failing or ambiguous.
- Production access details are unavailable.
Founder decision required:
- NO
- The runbook documents verified process after dependencies.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S043 — Founder Preview seeded-data readiness
Status: PLANNED
Priority: P1
Phase: Production deployment and operational readiness
Dependencies: S020, S025, S030
Blocked by: portal, estimating, and field-work hardening not complete
Target branch prefix: feat/
Recommended worktree type: backend
Primary owner: platform
Parallel-safe with: docs-only deployment branches
Conflicts with: seed workflow or demo data branches
Objective: Build or verify a realistic seeded Founder Preview data path using real modules and no fake analytics.
Why this matters: Founder Preview requires a populated, non-blank production slice with real customers, projects, estimates, proposals, contracts, jobs, invoices, activity, and tasks.
Verified current state: Product docs define exact preview data requirements; current seed workflow was repaired in PR #23.
Allowed paths: app/prisma/seed.ts, app/scripts/**, app/tests/**, docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md, docs/CURRENT_STATE.md, docs/SPRINT_BACKLOG.md
Forbidden paths: web redesign, production credentials, packages/**
Explicit exclusions: fake analytics, lorem ipsum, bypass auth, public demo shortcuts
Implementation tasks:
1. Inspect current seed and preview readiness.
2. Add realistic org/project/job/document records if needed.
3. Add verification notes and tests for seed viability.
Required tests:
- `cd app && npm test`
- `cd app && npm run test:integration`
- `cd app && npm run lint`
- `cd app && npm run build`
- `npm run docs:check -- --base origin/main`
Acceptance criteria:
- Preview data can populate the required Founder Preview surface.
- No fake analytics or auth bypass is introduced.
Documentation updates:
- docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md
- docs/CURRENT_STATE.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Seeded web-login credentials cannot be verified.
- Founder decides preview data should be curated externally instead.
Founder decision required:
- NO
- Requirements are already documented; curated content can be refined later.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S044 — Production smoke-test checklist
Status: PLANNED
Priority: P1
Phase: Production deployment and operational readiness
Dependencies: S041, S042, S043
Blocked by: environment verification, runbook, and seeded readiness not complete
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: non-deployment code branches
Conflicts with: deployment workflow branches
Objective: Create the human-executable production smoke-test checklist for auth, dashboard, customer/project, estimate, proposal, contract, invoice, job, portal, and docs.
Why this matters: RC readiness needs a repeatable click-through proof, not only unit and integration tests.
Verified current state: Founder Preview docs define a production slice; deployment environment still needs verification.
Allowed paths: docs/DEPLOYMENT_GUIDE.md, docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, .github/workflows/**, packages/**
Explicit exclusions: running production deploys, changing secrets, creating fake demo mode
Implementation tasks:
1. Translate verified product flows into a concise smoke-test checklist.
2. Separate local, preview, and production evidence requirements.
3. Add exact stop conditions for failed smoke checks.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- A reviewer can execute the checklist and record pass/fail evidence.
- The checklist covers all RC-critical connected flows.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Production URL or credentials are unavailable.
- Required seeded data cannot be produced.
Founder decision required:
- NO
- This is an execution checklist from approved scope.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S045 — Incident rollback and support-readiness packet
Status: PLANNED
Priority: P2
Phase: Production deployment and operational readiness
Dependencies: S044
Blocked by: production smoke checklist not complete
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: feature branches that do not edit deployment docs
Conflicts with: deployment runbook rewrites
Objective: Document support triage, rollback criteria, incident owner steps, and customer-safe communication for RC launch.
Why this matters: Launch readiness includes what happens when something breaks after release.
Verified current state: Repository has deployment and governance docs but no explicit RC incident support packet.
Allowed paths: docs/DEPLOYMENT_GUIDE.md, docs/REPOSITORY_GOVERNANCE.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, .github/workflows/**, packages/**
Explicit exclusions: adding external incident tooling, changing deployment automation
Implementation tasks:
1. Define severity levels and rollback decision points.
2. Document support evidence to collect before changing production state.
3. Link the packet from the handoff and deployment docs.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- RC support and rollback steps are clear and non-destructive.
- The packet does not claim automated rollback if none exists.
Documentation updates:
- docs/DEPLOYMENT_GUIDE.md
- docs/REPOSITORY_GOVERNANCE.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Founder wants a different operational support model.
- Deployment platform details are not known.
Founder decision required:
- YES
- Incident ownership and customer communication are business decisions.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

## Phase 10: Post-RC Cleanup And Launch Stabilization

### S046 — Compatibility-layer removal plan
Status: PLANNED
Priority: P2
Phase: Post-RC cleanup and launch stabilization
Dependencies: S010, S044
Blocked by: RC lifecycle hardening and production smoke checklist not complete
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: non-lifecycle branches
Conflicts with: lifecycle migration branches
Objective: Plan post-RC removal or migration of remaining compatibility lifecycle and role values.
Why this matters: Compatibility shims are useful for RC safety but should not become permanent ambiguity.
Verified current state: Current State and Workflow Lifecycles document tolerated legacy role and lifecycle values.
Allowed paths: docs/WORKFLOW_LIFECYCLES.md, docs/DOMAIN_MODEL.md, docs/ROADMAP.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, app/prisma/**
Explicit exclusions: executing migrations, deleting compatibility code before launch stabilization
Implementation tasks:
1. List every remaining compatibility shim after RC hardening.
2. Identify safe migration windows and rollback needs.
3. Create implementation sprint candidates without scheduling them before RC.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Post-RC compatibility cleanup is planned but not prematurely executed.
- Risks and data migration needs are explicit.
Documentation updates:
- docs/WORKFLOW_LIFECYCLES.md
- docs/DOMAIN_MODEL.md
- docs/ROADMAP.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Current production data shape is unknown.
- Cleanup would affect RC launch scope.
Founder decision required:
- NO
- This is a post-RC technical plan.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S047 — Live supplier feed integration decision
Status: BLOCKED
Priority: P2
Phase: Post-RC cleanup and launch stabilization
Dependencies: S045
Blocked by: supplier/provider selection and credentials decision
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: product
Parallel-safe with: non-supplier branches
Conflicts with: app/modules/supplier-integration/** implementation branches
Objective: Decide whether, when, and with which provider to replace the supplier feed stub with live ingestion.
Why this matters: Supplier queue/review plumbing is real, but live feed ingestion remains explicitly stubbed.
Verified current state: Settings and operations docs, app README, and Current State all identify live supplier feed fetching as not implemented.
Allowed paths: docs/modules/settings-and-operations.md, docs/PRODUCT_SCOPE.md, docs/ROADMAP.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, credentials, .github/workflows/**
Explicit exclusions: implementing a supplier connector without provider approval, storing API keys in docs
Implementation tasks:
1. Identify candidate supplier integration paths and constraints.
2. Decide whether live ingestion belongs in RC, post-RC, or remains deferred.
3. If approved, create a separate implementation sprint with security requirements.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Supplier feed status is no longer ambiguous.
- Implementation does not begin without provider/security approval.
Documentation updates:
- docs/modules/settings-and-operations.md
- docs/PRODUCT_SCOPE.md
- docs/ROADMAP.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- No provider, credential, or integration target is selected.
- Legal/security review is required.
Founder decision required:
- YES
- Live supplier ingestion is a product and vendor commitment.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S048 — Import wizard scope decision
Status: DEFERRED
Priority: P2
Phase: Post-RC cleanup and launch stabilization
Dependencies: S043
Blocked by: post-RC prioritization and founder scope decision
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: product
Parallel-safe with: non-onboarding branches
Conflicts with: onboarding or data-import implementation branches
Objective: Decide the first import wizard scope for customers, jobs, estimates, invoices, and rollback behavior.
Why this matters: Product docs define fear-free migration as strategic, but implementation needs careful domain and audit design.
Verified current state: Product docs describe CSV import direction; no generic import wizard exists in the current implementation.
Allowed paths: docs/product/TRADEOS_OWNER_EXPERIENCE.md, docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md, docs/PRODUCT_SCOPE.md, docs/ROADMAP.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**
Explicit exclusions: implementing import tables or UI before approval, live competitor API sync
Implementation tasks:
1. Choose first import object types and rollback expectations.
2. Define confirmation, duplicate review, audit, and partial-failure requirements.
3. Create implementation sprints only after scope is approved.
Required tests:
- `npm run docs:check -- --base origin/main`
- `git diff --check`
Acceptance criteria:
- Import scope is explicit and bounded.
- Deferred live competitor API sync remains out of scope.
Documentation updates:
- docs/product/TRADEOS_OWNER_EXPERIENCE.md
- docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md
- docs/PRODUCT_SCOPE.md
- docs/ROADMAP.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Founder decision is unavailable.
- Scope expands into QuickBooks or competitor live APIs.
Founder decision required:
- YES
- Data import affects onboarding promise, auditability, and migration risk.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S049 — Post-merge branch and worktree cleanup execution
Status: PLANNED
Priority: P2
Phase: Post-RC cleanup and launch stabilization
Dependencies: S003, S045
Blocked by: cleanup plan and support packet not complete
Target branch prefix: chore/
Recommended worktree type: recovery
Primary owner: platform
Parallel-safe with: none during deletion window
Conflicts with: any branch or worktree being actively used
Objective: Execute approved branch and worktree cleanup using Git-native commands after evidence and founder approval.
Why this matters: A clean repository surface keeps future autonomous sprint selection safe.
Verified current state: Multiple local worktrees and old branches are visible; deletion requires explicit approval and merge evidence.
Allowed paths: docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, file-system deletion of worktrees
Explicit exclusions: deleting unmerged work, force-deleting unknown branches, using `rm -rf`
Implementation tasks:
1. Re-verify every branch and worktree against merged/open PR state.
2. Execute only founder-approved cleanup commands.
3. Update handoff with exact removed and preserved items.
Required tests:
- `git worktree list`
- `git status --short --branch`
- `git fetch origin`
- `npm run docs:check -- --base origin/main` if docs change
Acceptance criteria:
- Only approved stale worktrees and branches are removed.
- Cleanup evidence is recorded.
Documentation updates:
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Any branch has unclear ownership or unmerged unique commits.
- Founder approval is missing.
Founder decision required:
- YES
- Cleanup can destroy local recovery paths if done incorrectly.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:

### S050 — RC stabilization retrospective and next-release cutline
Status: PLANNED
Priority: P2
Phase: Post-RC cleanup and launch stabilization
Dependencies: S045, S046, S049
Blocked by: production readiness and cleanup sprints not complete
Target branch prefix: docs/
Recommended worktree type: docs
Primary owner: platform
Parallel-safe with: none if it changes roadmap priorities
Conflicts with: roadmap or product-scope rewrite branches
Objective: Produce the RC stabilization retrospective and define the next-release cutline without reopening RC scope.
Why this matters: After RC hardening, the team needs a crisp stabilization/next-release boundary instead of drifting back into speculative features.
Verified current state: TradeOS is in RC1 hardening; deferred capabilities include live supplier feeds, route optimization, public payments, payroll/accounting, and inventory.
Allowed paths: docs/ROADMAP.md, docs/CURRENT_STATE.md, docs/PRODUCT_SCOPE.md, docs/ENGINEERING_COMMAND_CENTER.md, docs/SESSION_HANDOFF.md, docs/SPRINT_BACKLOG.md
Forbidden paths: app/**, web/**, packages/**, .github/workflows/**
Explicit exclusions: implementing next-release features, expanding RC scope
Implementation tasks:
1. Summarize completed RC hardening evidence and unresolved risks.
2. Reconfirm deferred capabilities and next-release candidates.
3. Reset the sprint backlog statuses for the next operating phase.
Required tests:
- `npm run docs:check -- --base origin/main`
- `npm run docs:test`
- `git diff --check`
Acceptance criteria:
- RC stabilization status is clear and evidence-backed.
- Next-release scope is separated from RC readiness.
Documentation updates:
- docs/ROADMAP.md
- docs/CURRENT_STATE.md
- docs/PRODUCT_SCOPE.md
- docs/ENGINEERING_COMMAND_CENTER.md
- docs/SESSION_HANDOFF.md
- docs/SPRINT_BACKLOG.md
Stop conditions:
- Founder wants to change product scope.
- Required launch evidence is missing.
Founder decision required:
- YES
- The next-release cutline is a product and business prioritization decision.
Completion evidence:
- PR:
- Merge commit:
- Tests:
- Notes:
