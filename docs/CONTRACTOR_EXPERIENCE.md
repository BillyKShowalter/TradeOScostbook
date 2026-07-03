# The Contractor Experience

**Author role:** Contractor Experience Architect
**Scope:** End-to-end product experience, from the moment a customer calls to the moment the job is paid. No backend or frontend code is proposed here — this is the workflow, screen, and interaction design that `docs/USER_FLOWS.md` (click-by-click detail) and `docs/UI_IMPROVEMENTS.md` (shortcuts/automation/AI recommendations) build on.
**Companion docs:** `docs/TradeOS-Engineering-Playbook.md` (product philosophy), `docs/tradeos-mvp-foundation-plan.md` (current MVP scope), `docs/frontend-platform-completion-plan.md` (earlier, broader platform plan).

This document reconciles both existing plans into one linear journey and extends it to the three stages neither plan has designed yet: **Scheduling**, **Payments**, and **Closeout**. Every stage below is marked with its build status against the actual repo as of this writing:

| Status | Meaning |
|---|---|
| 🟢 Built | Real API + UI exists today (`app/backend/`, `web/src/app/`) |
| 🟡 Partial | Backend exists, UI is thin, or the reverse |
| ⚪ Not built | Designed here for the first time |

---

## The Journey at a Glance

```
Customer calls
    │
    ▼
1. LEAD INTAKE  ⚪              →  a Lead is captured before it's a Customer
    │
    ▼
2. CRM  🟡                     →  Lead becomes a Customer + Project
    │
    ▼
3. SITE VISIT / AI INTAKE  🟢  →  scope, measurements, photos, AI follow-ups
    │
    ▼
4. ESTIMATE  🟢                →  priced line items from the org's cost book
    │
    ▼
5. PROPOSAL  🟢                →  branded document, sent, tracked, accepted
    │
    ▼
6. SCHEDULING  ⚪               →  crew, dates, milestones committed to a calendar
    │
    ▼
7. CONTRACT  🟢                →  signed, binding terms
    │
    ▼
8. INVOICE  🟢                 →  billed (full or progress), sent
    │
    ▼
9. PAYMENT  ⚪                  →  collected, reconciled, receipted
    │
    ▼
10. CLOSEOUT  ⚪                →  punch list, warranty, review request, archive
    │
    ▼
Job paid. Relationship kept warm for the next job.
```

Nothing in this journey is a dead end. A Lead can die at any stage (marked "Lost"). A Project can loop back (an accepted Proposal spawns a Change Order mid-job, which reopens Scheduling and adds to the final Invoice). Closeout explicitly reopens the CRM at the top — the point of a contractor CRM is the *next* job, not just this one.

---

## Design Principles

These apply to every stage below; they're stated once here instead of repeated ten times.

1. **The Project is the workspace, not the chat.** Every AI interaction writes its output back onto a project record (scope, questions, measurements, draft price) — never into a disposable chat transcript the contractor has to re-read to find what was decided. This is already the house rule in `TradeOS-Engineering-Playbook.md`; it should govern Scheduling/Payments/Closeout too.
2. **One thumb, one job site.** The contractor using this product is standing in a driveway, not sitting at a desk. Every primary action (log a call, snap a photo, send a proposal, check today's schedule, take a payment) must work one-handed on a phone in daylight. Desktop is for batch work (cost book maintenance, multi-project scheduling, reporting) — not for the moment-to-moment flow.
3. **Never block on the slow step.** A missing measurement shouldn't block sending a proposal with a price range. A missing signature shouldn't block scheduling a tentative start date. Every stage supports a "good enough for now" path forward, with the gap visibly flagged rather than silently allowed to be forgotten.
4. **Status is always visible, never re-derived.** The contractor should never have to remember "did I send that already?" A project's current stage is a first-class, always-on-screen fact (see the `status` enum already defined in `tradeos-mvp-foundation-plan.md`), not something inferred from reading a timeline.
5. **Money moments get their own attention.** Sending a proposal, presenting a contract for signature, and asking for payment are the three moments where a contractor's nerves are highest and where a bad UI costs real revenue. These get the most design care of any screens in the product (see Stages 5, 7, 9).
6. **AI proposes, the contractor decides.** Every AI-assisted step (intake follow-ups, proposal drafting, scheduling suggestions, payment-reminder tone) produces a reviewable draft, never a silently-applied change. This mirrors the existing rule in `docs/frontend-platform-completion-plan.md` §5 and should be the product's permanent AI contract, not a phase-3-only rule.

---

## Stage 0 — Before the Call: Company Setup

*(One-time, not part of the per-job loop, but every later stage depends on it.)*

Before a contractor can take their first call, the org needs: company profile (name, logo, phone, email, address — `organizations.logo_url/phone/email/address` per `tradeos-mvp-foundation-plan.md`), a default labor rate and markup percent, and at least a starter cost book (seeded trade templates, per the original onboarding wizard spec in `TradeOS-CostBook-Wireframe-Module-Spec.docx`). This is the onboarding wizard: 4 short screens (Company → Trade & Region → Default Pricing → Invite Team), skippable individually, revisitable from Settings forever. Nothing below this line works well without it — a proposal with no logo, or an estimate with no labor rate, looks unfinished the first time a contractor uses the product, which is the worst possible first impression.

---

## Stage 1 — Lead Intake ⚪

**Trigger:** The phone rings, a web form is submitted, a referral comes in, or a contractor meets someone at a supply house.

**Goal:** Capture *something* in under 30 seconds, before the contractor loses the customer's info scribbling it on a piece of scrap wood (the thing this product is supposed to replace).

**Key screens:**
- **Quick Capture** (a floating "+ New Lead" action, available from every screen, phone-first): name, phone, one-line job description, source (`Referral`/`Website`/`Google`/`Walk-up`/`Repeat customer`/`Other`). Three fields and a save button. Nothing else is required.
- **Lead List**: a triage view distinct from the Customer list — leads that haven't been called back, leads waiting on a site-visit date, leads that went cold. This is the view a contractor opens first thing in the morning, not the full customer list.
- **Lead Detail**: the captured fields, a call log (tap-to-call, auto-logs a timestamped "called" note), and one clear next action button that changes based on state: `Schedule Site Visit` → `Convert to Customer`.

**Data captured:** name, phone, optional email, job type (free text or a short picklist seeded from the org's cost-book divisions — driveway, deck, remodel, etc.), source, initial notes.

**Exit condition:** A Lead converts to a Customer + Project (Stage 2) the moment the contractor decides it's real, or is marked `Lost` with a one-tap reason (price, timing, went with someone else, not a fit) — reasons feed the pipeline-health view described in `UI_IMPROVEMENTS.md`.

**Why this doesn't already exist and should:** The current data model starts at `Customer`/`Project` (`tradeos-mvp-foundation-plan.md`). That's correct for a *committed* job, but a contractor takes far more calls than jobs — most calls are tire-kickers, bad-fit jobs, or jobs 3 months out. Forcing every call to become a full Customer record either pollutes the CRM with dead entries or (more likely) means contractors keep doing this step on paper, outside the product entirely. A lightweight Lead layer solves this without touching how Customers/Projects work downstream.

---

## Stage 2 — CRM: Customer & Project 🟡

**Goal:** Turn a real opportunity into the two anchor records everything else hangs off: the **Customer** (the relationship, which persists across jobs) and the **Project** (this specific job).

**Key screens (mostly built — `web/src/app/(app)/customers/*`, `projects/*`):**
- **Customer List** — search/filter, "new customer" action. 🟢 built.
- **Customer Detail** — contact info, notes, address, and (new) a **Project History** panel showing every past and current project for this customer, so a repeat customer's history is visible in one place rather than requiring a separate search. 🟡 partial — detail/edit exist, cross-project history rollup does not yet.
- **New Project** — name/title, job type, site address (can differ from customer address), linked customer, initial simple scope. 🟢 built.
- **Project Detail** — the single most important screen in the product; see below.

**Project Detail is the workspace, not a summary page.** Per Design Principle 1, this is where the contractor spends most of their time. It already has (🟢 built, per `web/src/components/projects/*`): a header with status badge, an overview card, a status timeline, quick actions, notes, a photo gallery, a files panel, and a recent-documents card. What it should also surface, tying this document's stages together:
- **Where this job is right now** — one of the ten stages above, shown as a single badge, not inferred.
- **What's next** — one clear, single primary button, contextual to status (`Start Site Visit` → `Build Estimate` → `Send Proposal` → `Schedule Job` → `Send Contract` → `Send Invoice` → `Record Payment` → `Start Closeout`). This is the thumb-first "what do I do next" answer, always in the same place.

**Exit condition:** Project has enough to start a Site Visit (Stage 3). This can happen the same day as intake — the CRM stage isn't a gate, it's a five-minute record-creation step.

---

## Stage 3 — Site Visit & AI Intake 🟢

**Goal:** Capture what the job actually requires — on site, on a phone, without typing a novel.

**Key screens (built — `web/src/app/(app)/projects/[id]/intake/page.tsx` and `web/src/components/intake/*`):**
- **Site Visit Form** — notes, measurements (structured, not free text, so they can be reused later), photo capture (camera-first on mobile), and an optional voice transcript field (already modeled as `site_visits.transcript` for future voice-to-text, per `tradeos-mvp-foundation-plan.md`).
- **AI Conversation Panel** — the AI reads the scope + notes + measurements and asks targeted follow-up questions (`ai-question-card.tsx`), shows a confidence meter (`ai-confidence-meter.tsx`) for how ready the project is to price, and lists explicit missing information (`ai-missing-information-panel.tsx`) rather than silently guessing.
- **Photo Gallery** — Supabase-Storage-backed, with delete support (per session log item — already live-verified end to end).

**Data captured:** typed/voice notes, structured measurements, up to 4 photos per intake pass (current MVP cap), AI-derived follow-up answers, a missing-info list, a confidence score.

**Exit condition:** Confidence is high enough to either (a) go straight to a fast Proposal with a price range (Stage 5, skipping a full line-item Estimate for a quick ballpark), or (b) build a full priced Estimate (Stage 4) for jobs that need line-item accuracy. Both paths are legitimate — a $400 fence-panel repair doesn't need the same rigor as a $60,000 remodel, and the product should not force one path on every job size.

---

## Stage 4 — Estimate 🟢

**Goal:** Turn scope into a priced, line-item-accurate number the contractor actually trusts, using the org's own cost book (labor rates, material costs, assemblies) — never a generic AI guess.

**Key screens (built — `web/src/app/(app)/projects/[id]/estimates/[estimateId]/builder.tsx`):**
- **Estimate Builder** — debounced search-as-you-type across cost items and assemblies, add/remove line items, quantity editing, a markup-vs-target-margin pricing panel, and a live running total.
- **Template Picker** (backend built, `isTemplate` assemblies) — reusable common-job starting points (e.g. "Residential Driveway Base Package") surfaced prominently so most jobs start from a template and get adjusted, rather than built line-by-line from nothing every time.

**AI's role here, precisely scoped:** the AI Estimate Assist concept from `frontend-platform-completion-plan.md` §5 — a scope-of-work box that suggests existing cost-item/assembly matches with quantities — is the right design and should feed *from* the Stage 3 intake data that's already captured, instead of asking the contractor to re-describe the job a second time. AI never invents a price; it only maps scope to the org's existing priced catalog, which the contractor accepts/edits/rejects line by line.

**Exit condition:** Estimate is finalized (locks pricing) and becomes the source for the Proposal.

---

## Stage 5 — Proposal 🟢

**Goal:** Present a professional, branded document the customer can say yes to — and know, without asking, whether it's been seen yet.

**Key screens (built — `web/src/app/(app)/projects/[id]/proposals/*`):**
- **New Proposal** — create from an Estimate or directly from Stage 3 project-first context (both creation modes already exist per `tradeos-mvp-foundation-plan.md`'s API plan), with scope of work, assumptions, exclusions, timeline, and a price (single figure or a low/high range for early-confidence jobs).
- **Proposal Review/Edit** — the contractor's last look before it goes out. This is a money moment (Design Principle 5): the send action should be unmistakable and distinct from every other button on the page.
- **Proposal Preview** — exactly what the customer will see, rendered, not a form-field summary.
- **Proposal Lifecycle Panel** — status through `draft → sent → viewed → accepted/rejected`, with timestamps. This status tracking is what turns "I think I sent that" into a fact on screen.

**Customer-facing surface (⚪ not yet built, and the single highest-leverage gap in this whole journey):** today, "sent" and "viewed" imply the customer receives *something* to view and respond to, but there is no designed customer-facing page. Stage 5 needs a **Customer Proposal View** — a public, tokenized link (no login required) showing the branded proposal with two buttons: **Accept** and **Request Changes**. Viewing it flips status to `viewed` automatically; accepting flips it to `accepted` and immediately unlocks Stage 6/7 for the contractor, with no phone tag required. This single page is likely the highest-ROI screen not yet designed in the entire product — it's the difference between "email a PDF and hope" and an actual conversion funnel with visibility.

**Exit condition:** Proposal `accepted` → Scheduling and Contract both become available (they can proceed in parallel, not strictly sequentially — see Stage 6/7 ordering note below).

---

## Stage 6 — Scheduling ⚪

**Goal:** Turn an accepted proposal into a committed date, crew, and set of milestones — the step every existing plan has explicitly deferred (`frontend-platform-completion-plan.md` §2 lists it "Nice-to-have / later," `tradeos-mvp-foundation-plan.md` doesn't model it at all), but which is a hard requirement to close this document's brief ("customer calls" → "job paid" cannot skip "job actually happens").

**Design stance:** keep this the smallest useful version, not a full crew-management/dispatch system — that's explicitly out of scope per the Engineering Playbook's "not another bloated contractor ERP" philosophy. The job to be done is: *the contractor and the customer both know when work starts, and the contractor can see everything committed across all active jobs on one screen.*

**Key screens:**
- **Job Calendar** — a week/month view across all active projects, each shown as a date range (start → estimated completion) with status color. This is the one genuinely desktop-lean screen in the product (a contractor planning three weeks of jobs wants to see them side by side), but must still degrade to a simple agenda list on mobile.
- **Schedule This Job** (from Project Detail) — start date, estimated duration or end date, optional milestones (e.g. "demo complete," "rough-in inspection," "final walkthrough" — free-form, not a rigid phase system), and an optional crew/assignee tag (a simple name/label field for the MVP, not a resourcing engine).
- **Today panel** (on the dashboard) — "what's on my plate today," pulled from the calendar, the first thing a contractor should see logging in each morning.

**Data captured:** scheduled start/end, milestones with target dates, assignee label(s), and a `rescheduled` flag/reason so a slipped date is visible history, not silently overwritten.

**AI opportunity:** conflict/overload flagging — warn when a new job's dates overlap heavily with existing committed work, rather than a hard block (contractors legitimately double-book on purpose sometimes; the AI's job is to surface the conflict, not prevent it).

**Exit condition:** Job has a committed start date. Contract signature (Stage 7) is not a hard prerequisite to scheduling a tentative date — per Design Principle 3, contractors often pencil in a start date before paperwork is fully signed, and the product should support "tentative" scheduling rather than forcing a strict linear gate.

---

## Stage 7 — Contract 🟢

**Goal:** Get a binding signature on the terms, cleanly, without requiring a third-party e-sign tool subscription for a small contractor (though one can be layered in later per `frontend-platform-completion-plan.md`'s risk mitigation).

**Key screens (built — `web/src/app/(app)/projects/[id]/contracts/[contractId]/*`):**
- **Contract created from an accepted Proposal** — terms pre-filled from proposal scope/price/payment schedule; the contractor should not have to retype anything already captured in Stage 5.
- **Sign Form** — signer name/email, drawn or typed signature capture, IP/timestamp recorded automatically. 🟢 built.
- **Signed Contract View** — read-only once signed (immutability is already enforced server-side per the session log), with a PDF download.

**Customer-facing surface (⚪ same gap as Stage 5):** a tokenized public **Customer Sign page**, parallel to the Customer Proposal View — the customer should be able to review and sign from a link on their phone without creating an account. This is the natural pairing to Stage 5's biggest gap and should be built as one shared "customer-facing document" pattern (view → act → confirmation) reused for both Proposal-accept and Contract-sign, rather than two separate one-off pages.

**Exit condition:** Contract signed → Invoice becomes available (full or first progress bill), and the job's status is unambiguously "won."

---

## Stage 8 — Invoice 🟢

**Goal:** Bill accurately against the job, whether that's one invoice at completion or several as work progresses.

**Key screens (built — `web/src/app/(app)/projects/[id]/invoices/*`):**
- **New Invoice** — from an estimate (100%, a subset, or a progress percentage), or custom line items for change-order-driven billing.
- **Invoice Detail** — line items, status (`draft → sent → paid`/`void`), and a PDF download (line-items-on-`getById` bug already fixed per session log item 40).
- **Invoice List** (per-project) — especially important for progress-billed jobs, where a contractor needs to see at a glance which of 3-4 invoices are outstanding.

**Exit condition:** Invoice sent → Payment (Stage 9) becomes actionable. For progress-billed jobs, Stages 8 and 9 repeat in a loop until the job total is fully billed and paid — this should be visualized as a **progress bar against total contract value**, not just a flat list of separate invoices, so "how much of this job is paid off" is answerable at a glance.

---

## Stage 9 — Payment ⚪

**Goal:** Get paid, without chasing a check, and know immediately when money has landed.

**Design stance:** this is the stage where "no code" design still needs to name a real mechanism, because the UX differs meaningfully depending on it. Recommend **Stripe** (or a similarly embeddable processor) for card/ACH collection, embedded directly on the Customer Invoice View described below — not a redirect to a third-party portal, which is where trust and conversion are lost. This mirrors the "keep AI behind the service boundary" philosophy already established for AI: keep the payment processor behind a service boundary too, so the UI never depends on a specific vendor's hosted checkout page.

**Key screens:**
- **Customer Invoice View** (tokenized public link, same pattern as Stages 5 and 7) — shows the invoice, a **Pay Now** button (card/ACH), and — critically — an equally prominent **"I'm paying another way"** acknowledgment (check/cash/wire) the customer or contractor can mark manually. Not every trade customer pays by card, and forcing digital payment as the *only* visible path will make the product feel unusable for a real chunk of this industry's customer base.
- **Record Manual Payment** (contractor-side) — amount, method, date, reference/check number, optional photo of the check. This is just as important as the digital path — possibly more important for this industry in the near term.
- **Payment Confirmation** — both customer and contractor see an immediate receipt-style confirmation; the invoice status flips to `paid` (or partially paid, with a running balance) the moment either digital payment clears or a manual payment is recorded.
- **Payment History** (per project and per org) — every payment against every invoice, exportable, the foundation for the deferred Reporting & Analytics module.

**Data captured:** amount, method, date, processor reference (if digital), recorded-by user, resulting invoice status.

**AI opportunity:** a drafted, tone-appropriate payment reminder (see `UI_IMPROVEMENTS.md`) for invoices unpaid past their due date — drafted, never auto-sent, per Design Principle 6; getting the tone wrong on a payment reminder can cost a customer relationship.

**Exit condition:** Invoice(s) fully paid → job financially closed. This is "job paid" — the literal endpoint named in the brief — but the experience isn't actually done yet (Stage 10).

---

## Stage 10 — Closeout ⚪

**Goal:** Formally close the job in a way that (a) protects the contractor (documented final state, signed-off punch list) and (b) sets up the next job with this customer, which is the entire point of having a CRM at all rather than a one-off invoicing tool.

**Key screens:**
- **Punch List** — a simple checklist of any open items from final walkthrough, each with a status and optional photo; when the list is empty/complete, the project can move to `completed`.
- **Final Walkthrough Sign-off** — a lightweight version of the Contract signature pattern: customer confirms work is complete and satisfactory, captured the same way a contract is signed (reuse the shared customer-facing document component from Stage 7, don't build a third one).
- **Warranty Record** — what's covered, for how long, auto-populated from any warranty terms already captured on the Proposal/Contract, so it's not manually re-entered.
- **Review Request** — a one-tap action to send the customer a review-site link (Google/Yelp/industry-specific) at the exact moment satisfaction is highest — immediately after a clean walkthrough sign-off, not weeks later.
- **Project Archive View** — the completed project's full history (scope → estimate → proposal → contract → invoices → payments → punch list) as one scrollable read-only record — the thing a contractor pulls up eight months later when the same customer calls back, closing the loop to Stage 1/2.

**Exit condition:** Project status → `completed`. Customer record stays live and searchable, with this project's full history attached — ready for the next call.

---

## Status Model Reconciliation

`tradeos-mvp-foundation-plan.md` already defines a `projects.status` enum: `lead → site_visit → proposal_draft → proposal_sent → accepted → in_production → completed → lost`. This document's ten stages map onto it directly, with two additions this experience design requires:

| This document's stage | Existing/extended `status` value |
|---|---|
| 1. Lead Intake | `lead` (or a new pre-project `Lead` record, per Stage 1's rationale) |
| 2. CRM | `lead` |
| 3. Site Visit / AI Intake | `site_visit` |
| 4. Estimate | *(sub-state within `site_visit`/`proposal_draft`, not its own top-level status)* |
| 5. Proposal | `proposal_draft` → `proposal_sent` |
| 6. Scheduling | **new:** `scheduled` (inserted between `accepted` and `in_production`) |
| 7. Contract | *(sub-state within `accepted`/`scheduled`)* |
| 8. Invoice / 9. Payment | **new:** `invoiced` (inserted between `in_production` and `completed`) — or, for progress-billed jobs, coexists with `in_production` since billing and work happen concurrently |
| 10. Closeout | `completed` |
| Any stage | `lost` |

This keeps the existing enum's spirit (a small, linear, honest set of states) while giving Scheduling and Invoicing/Payment their own visible status rather than burying them inside `in_production`, where "is this job scheduled yet?" and "has this been billed?" would otherwise be unanswerable without opening the project.

---

## What to Read Next

- **`docs/USER_FLOWS.md`** — every stage above, broken into literal screen-by-screen, click-by-click sequences, including decision branches and error/edge paths.
- **`docs/UI_IMPROVEMENTS.md`** — shortcuts, automation, and AI opportunities across the whole journey, prioritized by build status and impact.
