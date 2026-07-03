# UI Improvements — Shortcuts, Automation, and AI Opportunities

**Companion to:** `docs/CONTRACTOR_EXPERIENCE.md` (the journey and design principles), `docs/USER_FLOWS.md` (the click-by-click detail these recommendations attach to).

Every recommendation below names the flow/screen it applies to and a rough **Impact / Effort** call so this can be prioritized alongside real engineering work — not just a wishlist. "Effort" assumes the current stack (Next.js/React frontend, Express/Prisma/Postgres backend, existing RLS/module patterns) rather than a rewrite.

---

## 1. Shortcuts

Fast paths for actions a contractor repeats dozens of times a week. None of these change what's possible — they remove friction from what's already designed in `USER_FLOWS.md`.

| # | Shortcut | Applies to | Why | Impact / Effort |
|---|---|---|---|---|
| 1.1 | **Global `+ New` quick-action**, persistent across every screen (floating button on mobile, toolbar on desktop) — Lead, Customer, Project, all one tap away without navigating to a list screen first | Flows 1–2 | The single most common action ("someone just called") should never require more than one navigation | High / Low |
| 1.2 | **Tap-to-call with auto call-logging** — tapping any phone number opens the dialer, and returning to the app prompts a one-tap "log this call" instead of a typed note | Flow 1 | Removes the single biggest reason contractors abandon CRM tools: manual call logging feels like homework | High / Low |
| 1.3 | **Duplicate Project** — clone an existing project's estimate/scope structure (not customer/dates) as a starting point for a similar job for a different customer | Flow 4 | Contractors quote the same job type repeatedly (e.g. "another 250 sq ft driveway"); starting from a template assembly helps, but starting from a *whole prior project* is faster when it's nearly identical | Medium / Low |
| 1.4 | **Keyboard shortcuts on desktop-heavy screens** (Estimate Builder, Job Calendar): `/` to focus search, `Enter` to add the top search result, `Esc` to close a panel | Flow 4, 6 | These two screens are the ones actually used at a desk (per Design Principle 2) — power-user speed matters there specifically | Medium / Low |
| 1.5 | **"Send Again" on any tokenized customer link** — re-send a Proposal/Contract/Invoice link via a second channel (SMS in addition to email) in one tap, without regenerating a new document | Flow 5, 7, 8 | Emails get missed/spam-filtered; a contractor's instinct is to just call the customer, but a one-tap SMS re-send solves it without a phone call | High / Low |
| 1.6 | **Copy previous line item's price basis** — when adding a similar line item in the Estimate Builder, offer "same markup as last item" as a one-tap default rather than re-entering | Flow 4 | Small friction repeated dozens of times per estimate | Low / Low |
| 1.7 | **Swipe actions on list rows** (Lead List, Invoice List) — swipe to call, swipe to mark lost/paid, mobile-native pattern instead of tap-into-detail-then-act | Flow 1, 8 | List-triage is a mobile, one-handed task; native swipe gestures are faster than navigate-in/navigate-out | Medium / Medium |
| 1.8 | **"What's next" single button always visible on Project Detail**, already specified in `CONTRACTOR_EXPERIENCE.md` Stage 2 | All flows | Worth restating here as the umbrella shortcut: it collapses "which of the ten stages am I in and what do I do" into one tap, every time | High / Low |

---

## 2. Automation

Rule-based state changes and notifications — no AI/model inference required, just triggers on existing data.

| # | Automation | Applies to | Why | Impact / Effort |
|---|---|---|---|---|
| 2.1 | **Auto-flip status on customer action** — Proposal `sent → viewed` on link open, `viewed → accepted`/`changes requested` on customer action; same pattern for Contract `signed` and Invoice `paid`. Already designed into Flow 5/7/8; listing here because it's the automation with the single biggest trust payoff (Design Principle 4 — status is never re-derived) | Flow 5, 7, 8 | Removes the #1 manual-tracking task ("did they see it yet?") entirely | High / Medium (needs the tokenized customer-view pages from `USER_FLOWS.md`, which are ⚪ not built) |
| 2.2 | **Stale-lead nudges** — a Lead untouched for 3 days surfaces at the top of the Lead List with a "haven't followed up" flag; push/SMS digest each morning | Flow 1 | Leads die from neglect, not rejection, more often than contractors realize | High / Low |
| 2.3 | **Overdue-invoice nudges** — automatic surfacing (not auto-sending) of a **Send Reminder** action once an invoice passes its due date, escalating in visibility the longer it sits | Flow 8 | Cash-flow is the highest-stakes recurring pain point for small contractors; a visible nudge beats hoping someone remembers | High / Low |
| 2.4 | **Schedule conflict flagging**, already designed in Flow 6 step 2 — non-blocking banner when new dates overlap existing committed work | Flow 6 | Restated here as a rules-based (not AI) automation — pure date-range overlap detection, no model needed | Medium / Low |
| 2.5 | **Auto-populate Warranty from Contract terms** at Closeout, already designed in Flow 9 step 5 | Flow 9 | Removes a re-entry step, and more importantly means warranty terms can never drift from what was actually signed | Medium / Low |
| 2.6 | **Review-request timing automation** — trigger the Flow 9 step 6 review-request send at the exact moment of walkthrough sign-off, not on a delay or a manual reminder | Flow 9 | Timing is the whole game for review requests; satisfaction peaks right after a clean walkthrough and decays daily after | High / Low |
| 2.7 | **Auto-numbered, sequential document IDs** — Proposal/Invoice/Contract numbers generated automatically per-project (the backend already does this for Change Orders and Invoices per the session log; extend the same pattern everywhere a document needs a human-referenceable number) | Flow 5, 7, 8 | Contractors reference "Invoice #4" out loud on the phone; this needs to just work everywhere, consistently | Low / Low (mostly already built) |
| 2.8 | **Auto-archive to Project Archive View on completion**, already designed in Flow 9 step 7 | Flow 9 | No manual "clean up this project" step — completion itself produces the archived record | Medium / Low |
| 2.9 | **Deposit-triggered scheduling unlock** — optionally require a deposit invoice to be marked paid before a job's status can move past `Scheduled` into active work, configurable per-org (some contractors require deposits, some don't) | Flow 6, 8 | Encodes a real business rule some contractors want without forcing it on ones who don't (Design Principle 3 — never a hard gate for everyone) | Medium / Medium |

---

## 3. AI Opportunities

Every item here follows Design Principle 6 — **AI proposes, the contractor decides.** None of these should ever silently commit a change, send a message, or alter a price without an explicit human accept step, mirroring the pattern already established for AI Estimate Assist in `frontend-platform-completion-plan.md` §5 and the AI Intake follow-ups already built (Flow 3).

| # | Opportunity | Applies to | Design | Impact / Effort |
|---|---|---|---|---|
| 3.1 | **AI Estimate Assist fed from intake** (the existing planned capability from `frontend-platform-completion-plan.md`, now explicitly wired to Flow 3's captured scope/answers rather than a fresh text box) | Flow 3 → 4 | Scope + measurements + AI Q&A answers → suggested cost-item/assembly matches with quantities → contractor accepts/edits/rejects each line before it's added | High / Medium (much of the groundwork — AI intake, cost-book search — already exists) |
| 3.2 | **AI-drafted proposal narrative** — turn structured scope/assumptions/exclusions into contractor-editable prose for the Proposal document (a customer reads a paragraph better than a bullet list of line items) | Flow 5 | One "Draft with AI" button on the New Proposal form → fills the scope/assumptions/exclusions text fields with a draft the contractor edits before sending; never auto-sent | Medium / Low |
| 3.3 | **AI-drafted payment reminders**, already named in `CONTRACTOR_EXPERIENCE.md` Stage 9 | Flow 8 | Reminder tone shifts by how overdue (friendly nudge at 3 days, firmer at 30) — draft appears in the **Send Reminder** action from Automation 2.3, contractor reviews/edits/sends | High / Low |
| 3.4 | **Schedule-conflict-aware suggested dates** — instead of only flagging overlap after the fact (Automation 2.4), proactively suggest 2-3 open date ranges when starting Flow 6, based on existing committed jobs | Flow 6 | A step up from flagging: turns "here's a problem" into "here are three good options" | Medium / Medium |
| 3.5 | **Voice-to-structured-intake** — the `transcript` field already modeled in `site_visits` (per `tradeos-mvp-foundation-plan.md`) becomes an actual voice-to-text-to-structured-fields pipeline: contractor talks through the job walking the site, AI extracts notes + a first pass at measurements, contractor corrects rather than types from scratch | Flow 3 | This is the single highest "wow" moment for the target user described in `frontend-platform-completion-plan.md` (low technical sophistication, on-site, time-pressured) — talking is faster than typing on a phone in gloves | High / Medium |
| 3.6 | **AI closeout summary** — generate a short, customer-friendly "here's what we did" summary from the project's full history (scope → change orders → final punch list) for the Final Walkthrough page and/or an emailed job-complete summary | Flow 9 | Turns the Project Archive View's raw data into something worth sending the customer, reinforcing the relationship at the exact right moment (right before the review request) | Medium / Low |
| 3.7 | **AI change-order drafting from a mid-job note** — a contractor jots "customer wants to add a walkway extension" as a quick note on Project Detail mid-job; AI drafts a Change Order (scope + suggested line items from the cost book) for review, rather than the contractor starting a Change Order from a blank form | Mid-job (loops back into Flow 4/8) | Change Orders are already a first-class backend entity (session log item 4) — this closes the "capturing the ask" gap the same way Flow 3 closes it for the original scope | Medium / Medium |
| 3.8 | **Lead quality / fit scoring** — lightweight AI scoring of new leads (job type match to the org's actual trade/cost-book, price-range plausibility, source quality) surfaced as a soft signal on the Lead List, never an auto-reject | Flow 1 | Helps a busy contractor triage which of today's 6 calls to call back first — explicitly advisory, shown as a hint not a gate, consistent with Design Principle 6 | Low / Medium (needs Lead-stage data volume to be useful; sequence after Leads ship, not with them) |
| 3.9 | **Pipeline-health narration** — a short AI-generated weekly summary ("You lost 3 leads to price this month, all in the $8-12k range — your driveway pricing may be under recent supplier cost increases") surfacing on the dashboard, built from the same Lost-reason data captured in Flow 1 | Dashboard | Turns raw CRM data most contractors never look at twice into an actual insight, tying back to the org's real cost book (material price audits already exist server-side) rather than generic advice | Medium / Medium |

---

## 4. Prioritized Roadmap

Combining `CONTRACTOR_EXPERIENCE.md`'s build-status marks with this document's Impact/Effort calls, here is a suggested sequencing — not a commitment, a recommendation the team can push back on.

### Now (highest impact, most already scaffolded)
1. **Customer-facing tokenized views** (Proposal accept/reject, Contract sign, Invoice pay) — Flow 5/7/8's biggest ⚪ gap, and the prerequisite for Automations 2.1, which is itself the single highest-trust-payoff item in this whole document.
2. **Global `+ New` quick-action + tap-to-call logging** (Shortcuts 1.1, 1.2) — cheap, and the entire Lead layer feels broken without them.
3. **Overdue-invoice and stale-lead nudges** (Automations 2.2, 2.3) — pure rules on data that will already exist once Leads and Payments ship.

### Next
4. **Lead layer** (Flow 1) as a real, distinct stage from Customer/Project, per `CONTRACTOR_EXPERIENCE.md` Stage 1's rationale.
5. **Scheduling** (Flow 6) — minimum viable version (dates + milestones + a calendar view), deliberately not a full crew/dispatch system.
6. **AI Estimate Assist wired to intake** (AI 3.1) — the highest-leverage AI item because most of its dependencies (intake, cost-book search) already exist.
7. **AI-drafted proposal narrative and payment reminders** (AI 3.2, 3.3) — low effort, direct extensions of flows that already exist.

### Later
8. **Payments** (Flow 8's Stripe integration) — real effort (a payment processor integration, PCI-adjacent handling), sequenced after the customer-facing view pattern (item 1) already exists to embed into.
9. **Closeout** (Flow 9) — depends on Scheduling existing first (closeout naturally follows "work happened," which requires Scheduling to represent).
10. **Voice-to-structured-intake** (AI 3.5) — highest "wow" factor but the most technically involved AI item; sequence once the text-based intake/AI-assist flows have proven the review-and-accept UX pattern works.
11. **Lead scoring and pipeline-health narration** (AI 3.8, 3.9) — both need real usage data to be worth building; sequence after Leads have been live long enough to accumulate it.

### Explicitly not recommended for this phase
- Full crew/resource-dispatch scheduling, a general-ledger-grade accounting module, or a native e-signature/legal-compliance build-out — all would push this product toward the "bloated contractor ERP" the Engineering Playbook explicitly rejects. Where a narrow version of the underlying need exists (scheduling, payments, contracts), this document recommends the narrow version and, where relevant, a third-party integration (Stripe for payments) over an in-house rebuild.
