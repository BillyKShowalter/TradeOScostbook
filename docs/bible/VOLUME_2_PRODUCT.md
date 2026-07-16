---
status: current
owner: product
last_verified: 2026-07-16
source_of_truth: true
---

# TradeOS Bible — Volume 2: Product

## Purpose

This volume defines the contractor-facing product surface, the major workflows connecting modules, and the behavior expected from each role.

## Product domains

### Auth and tenancy

Every authenticated request must resolve a trusted organization context. Cross-organization access is prohibited by service validation and database policy.

### CRM

Customers, contacts, service addresses, notes, and activity provide the commercial starting point for project and job work.

### Projects and workspace

Projects organize customer work, estimates, proposals, contracts, jobs, files, invoices, and operational history.

### Cost book and assemblies

The cost book provides reusable material, labor, equipment, subcontractor, and assembly data for consistent estimating.

### Estimating and AI assistance

Estimating converts project scope into priced line items. AI assistance may draft and resolve suggestions but consequential writes remain review-first.

### Proposals and contracts

Approved estimates become customer-facing proposals and contractual documents with explicit lifecycle states and history.

### Jobs, scheduling, and dispatch

Accepted work becomes schedulable jobs with assignments, timing, priority, status, and conflict awareness.

### Invoices and payments

Completed or billable work becomes invoices. Payment records and collection status must remain auditable and organization-scoped.

### Customer portal

Customers can view relevant documents and workflow state through a controlled, branded experience.

### Brand Studio and settings

Organization identity, operational preferences, role settings, and document presentation are managed through settings and branding surfaces.

## Primary roles

### Owner / administrator

Needs business-wide visibility, financial attention, exceptions, approvals, configuration, and performance context.

### Dispatcher / office coordinator

Needs scheduled and unscheduled workload, technician assignment, conflict awareness, job detail, and rapid rescheduling.

### Estimator / salesperson

Needs customer context, cost data, assemblies, scope drafting, margin visibility, proposal creation, and follow-up state.

### Technician / field worker

Needs assigned work, service location, customer context, instructions, status controls, and completion evidence.

### Customer

Needs clear documents, approvals, expectations, status, branding, and trustworthy communication.

## Core end-to-end workflows

1. Lead or customer creation → project creation.
2. Project scope → estimate → reviewed AI assistance where applicable.
3. Estimate → proposal → customer decision.
4. Accepted proposal → contract and/or job creation.
5. Job → schedule → assignment → field execution.
6. Completion → invoice readiness → invoice → payment.
7. Every major transition → activity history and customer-visible state where permitted.

## Product acceptance standard

A module is not complete merely because its page renders. It must have:

- loading, empty, populated, error, and permission states;
- organization-safe data access;
- consistent lifecycle language;
- mobile-safe layouts where field use is expected;
- accessible controls and labels;
- activity or audit evidence for consequential changes;
- documentation aligned with actual behavior.

## Current product priorities

- lifecycle normalization;
- Founder Preview usefulness without fake data claims;
- durable branding and document consistency;
- customer portal hardening;
- dispatcher and field-work stabilization;
- production-ready estimating and AI assist.

## Related sources

- `docs/CURRENT_STATE.md`
- `docs/DOMAIN_MODEL.md`
- `docs/WORKFLOW_LIFECYCLES.md`
- `docs/RBAC_MATRIX.md`
- `docs/modules/`
- `docs/product/FOUNDER_PREVIEW_EXPERIENCE_SPEC.md`
