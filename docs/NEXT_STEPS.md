# Next Steps

## Immediate follow-up

1. Add persisted lifecycle event records so project timeline and activity no longer rely only on derived timestamps from project subdomains.
2. Add project-task editing beyond status changes, including bulk completion and lightweight field assignment filters.
3. Add change-order customer approval artifacts and signed acceptance capture on top of the current internal approval timestamps.
4. Add richer document taxonomy, signed artifact storage, and document-version visibility for plans, permits, and closeout packages.
5. Add warranty records, claim intake, and post-closeout reminders as a real backend-owned module.
6. Add AI suggestion acceptance and rejection logging so executive metrics can report a true acceptance rate instead of an instrumentation gap.

## What should stay out of scope

Do not start any of the following in Sprint 12 unless priorities change:

- Scheduling or dispatch workflows
- Payroll or accounting integrations
- Inventory management
- CRM redesign
- RAG or knowledge-runtime persistence rewrites
- Broad architecture rewrites or framework migrations

## Recommended Sprint 12

Sprint 12 should harden the operational lifecycle that Sprint 11 introduced.

Suggested deliverables:

1. Persist backend-owned activity events and use them as the source for the project timeline and dashboard activity feeds.
2. Add customer-facing change-order acceptance and signed artifact generation on top of the current change-order center.
3. Introduce a first-class warranty module with claim records, reminders, and closeout handoff metadata.
4. Add project-document versioning and structured document metadata while keeping the existing storage architecture.
5. Instrument AI estimate suggestion review outcomes so the executive dashboard can report real acceptance trends.
