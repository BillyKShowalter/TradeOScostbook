---
status: current
owner: product
last_verified: 2026-07-15
source_of_truth: true
related_code:
  - docs/product/TRADEOS_OWNER_EXPERIENCE.md
  - docs/product/TRADEOS_UX_ADVANTAGES.md
  - docs/research/CONTRACTOR_UX_RESEARCH.md
  - docs/CURRENT_STATE.md
  - docs/PRODUCT_SCOPE.md
  - docs/DOMAIN_MODEL.md
  - docs/API_REFERENCE.md
  - docs/RBAC_MATRIX.md
  - docs/WORKFLOW_LIFECYCLES.md
---

# Founder Preview Experience Spec

This is a build-ready specification for the TradeOS Founder Preview: a real production
slice, not a mock or a demo. It is directly usable as an implementation brief. It defines
what "done" looks like screen by screen, and draws a hard line between what is already
implemented (per `docs/CURRENT_STATE.md`) and what is genuinely new work for this
preview.

This spec does not re-derive product direction — see
`docs/product/TRADEOS_OWNER_EXPERIENCE.md` for the daily-experience rationale and
`docs/product/TRADEOS_UX_ADVANTAGES.md` for the differentiation thesis. This document is
where those decisions become concrete, checkable screens.

## Scope discipline

This spec targets the currently active `Lifecycle normalization` milestone posture in
`docs/ENGINEERING_COMMAND_CENTER.md`: no architecture rewrite, no broad UI redesign
beyond what's specified here, no live supplier-feed ingestion, no advanced dispatch/route
optimization, no public self-service payment processing. Anything in this spec that
implies new backend capability is called out explicitly as **new work**; everything else
assembles and hardens what `docs/CURRENT_STATE.md` already lists as implemented.

## Required preview state (production slice, not a mock)

A Founder Preview session must have all of the following true before it is considered
complete. None of these are new backend capability — they compose existing modules.

- **Real working authentication**: email/password sign-up, login, and httpOnly-cookie
  web session, exactly as already implemented (`docs/modules/auth-and-tenancy.md`). No
  bypass, no fake login screen.
- **Realistic company identity and branding**: the previewed org has a real name, logo,
  and brand colors applied through the existing Brand Studio
  (`docs/modules/brand-studio.md`), visible in the workspace chrome and on every
  generated document.
- **Realistic roles**: at least one owner/admin, one dispatcher, and one technician
  membership, using the existing role model (`docs/RBAC_MATRIX.md`).
- **Populated dashboard**: the command center (screen 3, below) reflects real records
  from the org's own data — no placeholder tiles.
- **Customers and service addresses**: at least a handful of real (seeded, not
  lorem-ipsum) customer records with service addresses, via the existing CRM module.
- **Projects**: at least one active project per customer segment shown.
- **Estimates**: at least one estimate per project, including at least one that has used
  AI Estimate Assist, to demonstrate the real (non-mock) advisory flow.
- **Proposals**: at least one proposal in each of draft, sent, and accepted states.
- **Contracts**: at least one signed contract, created from an accepted proposal.
- **Scheduled and unscheduled jobs**: at least one job with a technician assignment and
  a schedule, and at least one deliberately unassigned job, to exercise the command
  center's "unassigned jobs" row.
- **Invoices**: at least one invoice in each of draft, sent, and paid states, and at
  least one intentionally overdue, to exercise the command center's cash-flow rows.
- **Activity history**: real activity records from the actions above (jobs and
  intelligence primitives already emit these per `docs/CURRENT_STATE.md`).
- **Tasks or punch-list items**: at least one, wherever project tasks are currently
  supported.
- **No blank primary screens, no lorem ipsum, no fabricated analytics presented as
  real** — this is a hard requirement, not a preference. Any tile that cannot be backed
  by a real record must be omitted, not filled with a placeholder.

## The exact first experience

### 1. Short branded loading transition

A brief, branded loading state using the org's own logo/color (once resolved) rather than
a generic spinner — this is existing-capability composition (Brand Studio + session
resolution), not new backend work.

### 2. First-time onboarding or returning-user detection

- **Returning user with a valid session** → skip straight to the command center (screen
  3).
- **Returning user, no valid session** → login screen, then the command center.
- **New organization, first login** → the onboarding flow defined in
  `docs/product/TRADEOS_OWNER_EXPERIENCE.md` (brand confirmation → migration path
  choice → import or quick-start → team setup, all skippable → QuickBooks connect,
  optional). **New work**: the brand-confirmation-from-URL step and the generic
  import wizard do not exist yet and are the primary new-build surface of this preview.
- Acceptance check: a brand-new org must never land on an empty dashboard; if the
  contractor skips both import and quick-add, the workspace still shows a clear,
  single, non-blank next action (e.g. "Add your first customer"), not an empty grid.

### 3. Owner command center

Composes existing data (jobs/scheduling, estimates, proposals, contracts, invoices,
change orders, supplier price-review queue) into the three-tier hierarchy defined in
`docs/product/TRADEOS_OWNER_EXPERIENCE.md`. **New work**: the aggregation screen itself
— today this data exists but is not assembled into one command-center view per
`docs/CURRENT_STATE.md`'s module list (jobs surface through the project workspace, not a
unified daily view).

### 4. Needs-attention area

The Tier 2 decision queue: callouts, unassigned jobs, job risk flags, weather-flagged
exterior jobs, escalations, material blockers, ready-to-invoice, overdue invoices, aged
estimates/proposals, punch-list deadlines — ranked by consequence-if-ignored, each row
actionable in place. **New work**: the ranking/aggregation logic and the row-level
inline actions; the underlying records (jobs, invoices, estimates, proposals) already
exist.

### 5. Today's schedule

A same-day view of scheduled jobs and technician assignments, sourced from the existing
jobs-and-scheduling module (`docs/modules/jobs-and-scheduling.md`). Note the module's own
documented limitation: "richer dispatcher board UX remains separate from the core
backend engine" — this screen is exactly that richer UX layer, built on the existing
engine, not a new scheduling backend.

### 6. Weather context

Present only as rows inside the needs-attention queue for jobs explicitly tagged as
exterior work with adverse forecast in their scheduled window — never a standing,
always-on weather widget. **New work**: weather-data integration and the
exterior-work tagging did not previously exist and must be scoped as a genuinely new,
small integration (a weather API lookup keyed to job address and scheduled window) —
call this out honestly as new work in any implementation plan, not an assembly of
existing capability.

### 7. Task/punch-list context

Surfaces punch-list items due today/tomorrow across active jobs, wherever project tasks
already exist in the product (project tasks are listed as implemented in
`docs/CURRENT_STATE.md`).

### 8. Money context

One cash snapshot number (aggregate overdue dollars) in Tier 1, with ready-to-invoice and
overdue-invoice detail rows in Tier 2, sourced from the existing invoices module. No
trend charts or aging-bucket breakdowns belong on this screen — those live in the Tier 3
drill-in.

### 9. TradeOS-prepared actions

Same-row actions on each Tier 2 item (reassign, approve invoice, send follow-up, approve
material reorder) that resolve the item without navigating away. **New work**: the
inline-action layer; the underlying mutations (job reassignment, invoice send, etc.)
already exist as API operations and should be reused, not reimplemented.

### 10. Approvals

Change-order approval, supplier price-review approval, and any invoice/write-off outside
standard terms route here — these already exist as distinct workflows
(`docs/modules/settings-and-operations.md`'s supplier review queue, change orders) and
this screen surfaces them together rather than requiring separate navigation to each.

### 11. Voice control

Scoped strictly to the commands enumerated in
`docs/product/TRADEOS_OWNER_EXPERIENCE.md` (status summary, callout read-back,
confirmed reassignment, overdue-invoice read-back, call/text handoff, job-blocker
read-back, status-only job completion, weather read-back). **This is explicitly out of
scope for the Founder Preview's first build** unless the implementation team confirms
speech-to-text infrastructure is already available — flag as a follow-on phase, not a
day-one requirement, to avoid overcommitting new AI/voice infrastructure inside this
preview's timebox.

### 12. Global navigation

Role-aware navigation: owner/admin sees the command center plus full workspace
navigation (customers, projects, cost book, settings); technician sees a reduced surface
(today's jobs, job detail, photo/note capture) per the role-specific-cockpit direction
in `docs/product/TRADEOS_UX_ADVANTAGES.md` item 6. **New work for this preview**: the
technician-specific reduced navigation does not yet exist as a distinct surface; owner/
admin navigation already exists and should not be rebuilt.

## Design-system alignment

Reference only — do not duplicate the full design system into this repository. The
canonical source lives in `404TradeOS-LLC/404-tradeos`,
`docs/design/source-import/project/`.

- **Blueprint** (the light, cool-graphite product theme — `.theme-blueprint` token set:
  `--ink-*` neutrals on `--paper`/`--ink-50` surfaces) is the correct environment for
  the TradeOS product UI described in this spec, not **Forge** (the dark, warm-copper
  marketing theme), which belongs to the 404 TradeOS marketing site only.
- Copper (`--copper-500` / `#B87333`) remains the sole accent color, used sparingly —
  primary actions and active states only, never as a background fill for informational
  content.
- Green (`--status-online` / `--success-600`) means success/online state only — never
  used for a neutral "informational" badge.
- One primary action per screen: on the command center, the single primary action is
  "resolve the next queue item," not a competing set of equally weighted buttons.
- Borders over shadows: use `--border-default` / `--border-strong` token-equivalent
  hairlines for card and row separation, not drop shadows.
- Space Grotesk for headings/display text only; Roboto Mono for machine-output,
  timestamps, and dense tabular labels (job IDs, dollar figures in tables); system sans
  for body/UI text — matching `docs/design/source-import/project/tokens/fonts.css`.
- Dense but readable: the Tier 2 queue should read as a compact list, not cards with
  large whitespace — this is an operational tool, not a marketing page.
- No modal-on-modal stacking: inline row actions (expand-in-place) are preferred over a
  modal launching a second modal, consistent with `docs/product/TRADEOS_OWNER_EXPERIENCE.md`'s
  same-row action requirement.
- No marketing language inside the product: the command center and onboarding screens
  use plain operational language ("3 things need you today"), never marketing copy.
- No blank screens, real data over placeholders, and when in doubt, cut rather than add
  — apply this literally to every screen enumerated above.

## Screen-by-screen acceptance checklist

**1. Branded loading transition**
- [ ] Uses the previewed org's actual logo/color once session/org resolves
- [ ] No generic, unbranded spinner shown for more than a brief initial resolve state
- [ ] Transition duration is short — this is a bridge, not a destination

**2. Onboarding / returning-user detection**
- [ ] A session with a valid cookie skips directly to the command center
- [ ] An expired/missing session routes to login, not a broken state
- [ ] A brand-new org completes brand confirmation with editable, pre-filled fields
- [ ] Skipping import or team setup does not block entry to the workspace
- [ ] A contractor who skips every optional step still sees a populated, non-blank
      workspace with exactly one clear next action

**3. Owner command center**
- [ ] Tier 1 status band shows day-status, crew coverage, unassigned count, cash
      snapshot, and escalation flag (only if one exists)
- [ ] On a day with nothing wrong, Tier 1 renders visibly calm/near-empty, not padded
      with filler content
- [ ] Tier 2 queue is a single ranked list, not multiple competing panels
- [ ] No revenue/profit trend chart, leaderboard, or activity feed appears in Tier 1/2

**4. Needs-attention area**
- [ ] Every row shows a suggested resolution, not just a bare fact
- [ ] Every row is actionable in place (no forced navigation to resolve)
- [ ] Ranking reflects consequence-if-ignored (a callout outranks a stale estimate)

**5. Today's schedule**
- [ ] Shows real technician assignments and job times for the current day
- [ ] Unassigned jobs are visually distinct, not mixed silently into the assigned list

**6. Weather context**
- [ ] Appears only as rows for exterior-tagged jobs with adverse forecast
- [ ] Does not appear as a standing widget on a normal-weather day

**7. Task/punch-list context**
- [ ] Shows only items due today/tomorrow in Tier 2; overdue-only escalates to owner
      attention, in-progress items do not clutter the queue

**8. Money context**
- [ ] Tier 1 shows one aggregate overdue-dollar figure, no chart
- [ ] Tier 2 shows ready-to-invoice and overdue rows with real dollar amounts from
      seeded invoice data

**9. TradeOS-prepared actions**
- [ ] Reassigning a job, approving an invoice, and sending a follow-up are each
      completable without leaving the command center screen

**10. Approvals**
- [ ] Change-order and supplier-price approvals are reachable from the command center,
      not only from their original module screens

**11. Voice control**
- [ ] Explicitly deferred for this preview unless speech infrastructure is confirmed
      available; if deferred, no half-built voice UI ships (no dead microphone button)

**12. Global navigation**
- [ ] Owner/admin session sees full navigation; technician session sees the reduced
      surface; no role sees a navigation item it cannot act on

## What this spec does not commit to

- It does not commit to building voice control in this pass (see item 11).
- It does not commit to any live, automated migration from ServiceTitan, Jobber,
  Housecall Pro, or Buildertrend — only the generic CSV import wizard, per
  `docs/product/TRADEOS_OWNER_EXPERIENCE.md`'s MVP boundaries.
- It does not commit to weather integration being trivial — it is called out above as
  genuinely new scope, not existing-capability assembly.
- It does not redesign any module's underlying data model; every "new work" item above
  is a UI/aggregation layer over data TradeOS already persists.
