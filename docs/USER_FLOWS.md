# User Flows — Screen by Screen, Click by Click

**Companion to:** `docs/CONTRACTOR_EXPERIENCE.md` (the narrative/why), `docs/UI_IMPROVEMENTS.md` (shortcuts/automation/AI). Read the experience doc first — this document assumes its stage numbering, design principles, and build-status legend (🟢 built / 🟡 partial / ⚪ not built).

**Format:** every flow is a numbered sequence of `Screen → Action → Result`. Branches are called out explicitly. Primary (money-moment) buttons are **bolded**; secondary/destructive actions are noted as such.

---

## Flow 1 — Capture a Lead ⚪

**Entry point:** anywhere in the app (persistent quick-action), or a public web-to-lead form.

1. **Any screen** → tap the persistent `+ New Lead` button (bottom-right on mobile, top toolbar on desktop) → **Quick Capture sheet** opens over the current screen (no navigation away).
2. **Quick Capture sheet** → fill Name (required), Phone (required), Job description (one line, required), Source (picklist, defaults to last-used value) → tap **Save Lead**.
3. Result: sheet closes, a toast confirms "Lead saved," and the Lead appears at the top of the Lead List. No redirect is forced — the contractor is exactly where they were before, so a call can be logged mid-task without losing place.

**Alternate entry — inbound web form:** a customer submits a public "Request a Quote" form on the contractor's site → a Lead is created automatically with `source = Website` → the contractor receives a push/SMS notification → tapping the notification opens **Lead Detail** directly.

**Lead List → Lead Detail:**
4. **Lead List** (grouped: `Needs Callback` / `Site Visit Scheduled` / `Cold`) → tap a lead row → **Lead Detail** opens.
5. **Lead Detail** → tap the phone number → device dialer opens; on call end, the app auto-prompts "Log this call?" → one tap adds a timestamped note without typing.
6. **Lead Detail** → primary button reads **Schedule Site Visit** (if not yet scheduled) or **Convert to Customer** (if ready to commit) → see Flow 2.
7. **Lead Detail**, secondary action → **Mark Lost** → a one-tap reason sheet (`Price` / `Timing` / `Chose someone else` / `Not a fit` / `Other`) → lead moves to the `Lost` group, remains searchable, never deleted.

---

## Flow 2 — Convert a Lead into a Customer + Project 🟡

1. **Lead Detail** → **Convert to Customer** → a pre-filled **New Customer** form opens (name/phone carried over from the lead) → contractor confirms/edits, adds address if known → **Save Customer**.
2. Result: **Customer Detail** opens automatically, showing the new customer with zero project history yet.
3. **Customer Detail** → **+ New Project** → **New Project form**: title, job type (picklist seeded from cost-book divisions), site address (defaults to customer address, editable), initial scope (free text, carried over from the lead's one-line description if present) → **Create Project**.
4. Result: **Project Detail** opens, status badge shows `Lead`, primary action button reads **Start Site Visit** → Flow 3.

**Alternate — returning customer:** **Customer List** → search/select an existing customer → **Customer Detail** → **+ New Project** (same as step 3 onward). The **Project History** panel on Customer Detail shows all prior projects, so the contractor can glance at what this customer has bought before starting the new one.

---

## Flow 3 — Site Visit & AI Intake 🟢

1. **Project Detail** → **Start Site Visit** → **Site Visit Form** opens.
2. **Site Visit Form** → enter notes (typed or, where available, tap the mic icon to dictate — becomes `transcript`) → enter structured measurements (labeled fields: length/width/height/quantity, not one free-text box) → tap **Add Photo** (opens camera directly on mobile, not a generic file picker) up to 4 photos → **Save Site Visit**.
3. Result: the **AI Conversation Panel** appears below the saved visit, already populated — no separate "generate" step required.
4. **AI Conversation Panel** → read each **AI Question Card** (e.g. "Is the existing driveway base gravel or concrete?") → tap to answer inline (short text or quick-pick chips where the question has obvious options) → answers save immediately, one at a time, not as a batch form.
5. **AI Confidence Meter** updates live as questions are answered (e.g. `42% → 78%`) and the **Missing Information Panel** shrinks accordingly.
6. Decision point, surfaced as two buttons that both stay visible throughout:
   - **Build Full Estimate** (recommended once confidence is high, or any time the contractor wants line-item accuracy) → Flow 4.
   - **Skip to Quick Proposal** (available any time, for small/simple jobs) → Flow 5, price-range path.
7. Secondary action, always available: **Add More Photos / Another Visit** — a project can have multiple site-visit passes (e.g. initial call + a follow-up measure), each appended to the same project timeline, never overwriting the prior one.

---

## Flow 4 — Build an Estimate 🟢

1. **Project Detail** (or directly from Flow 3 step 6) → **Build Full Estimate** → **Estimate Builder** opens, pre-titled from the project.
2. **Estimate Builder** → **Suggested Templates** strip at the top shows `isTemplate` assemblies matching the job type → tap one → its line items are added in one action, each pre-priced from the cost book.
3. **Estimate Builder**, search bar → type-ahead search (debounced) across cost items and assemblies simultaneously → results grouped by type → tap a result → **Add Line Item** with a default quantity of 1 → tap the quantity field to adjust.
4. Per line item, inline controls: edit quantity, edit description, **Remove** (trash icon, no confirmation dialog for draft-state items — removal is cheap and reversible by re-adding).
5. **Pricing Panel** (collapsible, bottom of screen on mobile / side panel on desktop) → toggle between **Markup %** and **Target Margin %** modes → adjust the value → the running total in the header updates live.
6. When line items are complete → **Finalize Estimate** (secondary-styled — finalizing locks pricing, it is not the "send to customer" action, so it should not visually compete with Flow 5's send button) → confirmation sheet: "Finalizing locks this estimate's pricing. You can still create a new revision later." → **Confirm**.
7. Result: **Project Detail** status badge updates, primary action becomes **Create Proposal** → Flow 5.

**Branch — AI Estimate Assist (future capability, designed in `UI_IMPROVEMENTS.md`):** step 2 above gains a third option, **AI Suggest from Intake** — pre-fills a review list of suggested line items/quantities pulled from the Flow 3 scope + answers, each individually accept/edit/reject before anything is added to the estimate.

---

## Flow 5 — Create & Send a Proposal 🟢 (customer view ⚪)

1. **Project Detail** → **Create Proposal** → **New Proposal form**, two paths:
   - **From Estimate** (if Flow 4 was completed) — price, scope, and line-item detail pre-fill from the finalized estimate.
   - **Quick / Price Range** (if Flow 3's "Skip to Quick Proposal" was chosen) — contractor enters a low/high price estimate directly, scope of work drawn from the intake notes.
2. **New Proposal form** → fill/confirm scope of work, assumptions, exclusions, timeline, payment schedule (deposit %, milestone %s) → **Save Draft**.
3. **Proposal Review screen** → **Preview** tab shows exactly the branded document the customer will see (not a field summary) → contractor scrolls the full preview before sending, matching Design Principle 5 (money moments get full attention).
4. **Proposal Review screen** → **Send to Customer** (primary, visually distinct — e.g. the only filled/colored button on the page, everything else outlined) → a confirmation micro-sheet: "Send to [customer email]?" with the email editable inline → **Confirm & Send**.
5. Result: status flips to `sent`, a timestamp appears on the **Proposal Lifecycle Panel**, and a tokenized link is emailed to the customer.

**Customer side (⚪ not yet built — designed here):**
6. Customer taps the emailed link → **Customer Proposal View** opens in their browser, no login/account required. The instant this page loads, status silently flips to `viewed` (visible back on the contractor's Lifecycle Panel in near-real-time).
7. **Customer Proposal View** → two buttons: **Accept Proposal** and **Request Changes**.
   - **Accept Proposal** → a short confirmation ("By accepting, you agree to proceed at $X") → **Confirm Acceptance** → status flips to `accepted`; customer sees a "Thanks — your contractor will follow up shortly" confirmation screen.
   - **Request Changes** → a free-text box ("What would you like changed?") → **Send Feedback** → the contractor gets a notification with the note attached to the project, proposal stays in `sent`/`viewed` state (not rejected — this is a conversation, not a dead end).
8. Back on the contractor side: **Project Detail** status badge updates automatically to `Accepted`; primary action becomes **Schedule Job** (Flow 6) and a secondary action **Create Contract** (Flow 7) both appear — these are not sequential gates, either can be started first.

---

## Flow 6 — Schedule the Job ⚪

1. **Project Detail** → **Schedule Job** → **Schedule form**: start date (date picker), estimated end date or duration, milestones (optional, add-a-row pattern: label + target date), crew/assignee label (free-text tag, autocompletes from previously used tags) → **Save Schedule**.
2. If the new dates heavily overlap existing scheduled work → an inline, non-blocking banner: "This overlaps with [Other Project] (Jun 12–18). Still fine to schedule?" with a **Schedule Anyway** confirmation, never a hard block.
3. Result: **Project Detail** status badge updates to `Scheduled`; the job now appears on the **Job Calendar**.
4. **Job Calendar** (own nav item) → month/week view → each project renders as a colored date-range bar → tap a bar → returns to that project's **Project Detail**.
5. **Dashboard → Today panel** → lists jobs with a milestone or start/end date today → tap an entry → **Project Detail**.
6. **Rescheduling:** **Project Detail** → **Edit Schedule** → change dates → a required one-line reason (`Weather` / `Customer request` / `Crew conflict` / `Other`) → **Save** → the prior date range is kept as visible history on the project timeline, not overwritten silently.

---

## Flow 7 — Contract Sign 🟢 (customer view ⚪)

1. **Project Detail** → **Create Contract** → terms pre-fill entirely from the accepted Proposal (scope, price, payment schedule) → contractor reviews, edits only if needed → **Save Contract**.
2. **Contract Detail** → **Send for Signature** (primary, same visual treatment as Flow 5's Send button — this is also a money moment) → tokenized link emailed to the customer.

**Customer side (⚪ not yet built — reuses the Customer Proposal View pattern from Flow 5):**
3. Customer taps the link → **Customer Sign Page** — full contract text, scroll-to-bottom pattern (signature button disabled until scrolled, a standard e-sign affordance) → **Sign Contract** → signature capture (typed name, or draw-with-finger on mobile) → **Submit Signature**.
4. Result: IP + timestamp recorded automatically, status flips to `signed`, customer sees a confirmation screen with a **Download Signed PDF** link.
5. Back on the contractor side: **Project Detail** status badge updates to `Contract Signed`; primary action becomes **Send Invoice** (Flow 8).

**Alternate — in-person signing:** **Contract Detail** → **Sign In Person** (secondary action, for contractors who close the deal at the kitchen table) → hands the device to the customer → same **Sign Contract** capture screen, but rendered directly in-app instead of via emailed link.

---

## Flow 8 — Invoice & Get Paid 🟢 (payment ⚪)

1. **Project Detail** → **Send Invoice** → **New Invoice form** → choose billing mode:
   - **Full amount** — pulls 100% of the contract value.
   - **Progress billing** — enter a percentage or select specific line items/milestones (e.g. "Deposit — 30%", tied optionally to a Flow 6 milestone).
   - **Custom** — for change-order-driven or one-off billing.
2. **New Invoice form** → review line items, due date → **Save Draft** → **Invoice Detail** opens.
3. **Invoice Detail** → **Send to Customer** (primary) → tokenized link emailed; status flips to `sent`.

**Customer side (⚪ not yet built — designed here, extends the Flow 5/7 tokenized-link pattern):**
4. Customer taps the link → **Customer Invoice View** — invoice detail, then two clearly separated actions:
   - **Pay Now** (primary, card/ACH via embedded Stripe element — no redirect off-page) → standard card/bank entry → **Pay $X** → processor confirms → **Payment Confirmation screen** for the customer, and the invoice flips to `paid` (or partially paid) instantly.
   - **I'm Paying Another Way** (secondary but equally visible, not buried) → a short note: "Let your contractor know — cash, check, or wire" → notifies the contractor to expect/record it manually.
5. **Contractor side — Record Manual Payment:** **Invoice Detail** → **Record Payment** → amount (defaults to balance due, editable for partial payments), method (`Check`/`Cash`/`Wire`/`Other`), date, reference number, optional photo of the check → **Save Payment**.
6. Result: **Invoice Detail** shows a running **Payment History** list and an updated balance; when balance reaches $0, status flips to `paid` automatically (digital and manual paths converge on the same state transition).
7. For progress-billed projects: **Project Detail** shows a **Billing Progress bar** ("$14,200 of $22,000 billed, $9,800 collected") aggregating every invoice on the project, not just the most recent one → tap it → **Invoice List** (per-project), each row showing amount/status/due date.

**Overdue handling:** an invoice `sent` and unpaid past its due date surfaces a **Send Reminder** action on Invoice Detail — see `UI_IMPROVEMENTS.md` for the AI-drafted reminder design (draft-then-send, never auto-sent).

---

## Flow 9 — Closeout ⚪

1. **Project Detail** (once fully paid, or once work is physically complete even if a final progress bill is still pending) → **Start Closeout** → **Punch List** opens.
2. **Punch List** → **+ Add Item** → short description, optional photo → repeat for every open item found on final walkthrough → each item toggles `Open`/`Resolved`.
3. Once all items are `Resolved` (or the list is empty) → **Request Walkthrough Sign-off** → tokenized link emailed to the customer (same pattern as Flow 7).
4. **Customer side:** customer taps the link → **Final Walkthrough Page** — summary of work completed, the (now-empty) punch list for their own review, → **Confirm Complete & Satisfied** → lightweight signature capture (same component as Flow 7's Sign Contract) → **Submit**.
5. Result: **Project Detail** status flips to `Completed`; a **Warranty Record** auto-populates from any warranty terms captured on the Proposal/Contract, viewable read-only.
6. **Project Detail** → **Send Review Request** (appears automatically right after step 4, timed to the moment of highest satisfaction) → picks a review link (Google/Yelp, configured once in Settings) → **Send** → a short templated message goes to the customer.
7. **Project Detail** now renders as the **Project Archive View** — every stage's artifacts (site visit, estimate, proposal, contract, invoices, payments, punch list) laid out as one scrollable read-only timeline.
8. From here, **Customer Detail** (tap the linked customer name) → **Project History** panel now shows this completed project alongside any prior ones → **+ New Project** is one tap away the next time this customer calls — closing the loop back to Flow 2.

---

## Edge & Error Paths Worth Designing Deliberately

These cut across multiple flows above and deserve explicit, consistent handling rather than ad hoc per-screen decisions:

| Situation | Handling |
|---|---|
| Contractor navigates away mid-form (any flow) | Autosave draft state every field-blur; returning to the same screen restores it. Never lose a half-typed proposal because a phone call came in. |
| Customer's tokenized link (Proposal/Contract/Invoice) is opened after the underlying record changed (e.g. contractor edited the price after sending) | The customer view always renders the *current* record state, with a small "updated [time]" note if it changed since last sent — never a stale cached copy. |
| Customer tries to pay an invoice that's already been paid (e.g. two tabs open) | Customer Invoice View shows a clear "This invoice has already been paid" state instead of a broken/duplicate charge attempt. |
| Contractor tries to send a Proposal/Contract/Invoice with an obviously invalid customer email | Inline validation blocks the **Send** action specifically (not the whole form) with a one-line fix-it prompt. |
| Contractor wants to void/cancel after sending (Invoice) | **Void Invoice** (secondary, requires a reason) — void invoices remain visible in history, never deleted, consistent with the Lead "Mark Lost" pattern. |
| Site visit photo upload fails (bad connection, on a job site) | Photo queues locally with a visible "uploading" badge and retries automatically when connectivity returns — never silently drops a photo taken in the field. |
