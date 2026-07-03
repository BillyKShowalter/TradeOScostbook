# System Architecture

_As-built, based on the 2026-07-03 repository audit. For the forward-looking AI pipeline design, see `AI_ESTIMATING_ARCHITECTURE.md`; this document describes what exists today._

## Overview

Three independently-deployable pieces, plus one not-yet-connected data asset:

```
┌─────────────────────┐        ┌──────────────────────────┐
│   web/ (Next.js 16)  │ ─────▶ │   app/ (Express + Prisma)  │
│   Supabase Auth       │  HTTPS │   bearer JWT + forced RLS  │
│   Server Actions +    │◀───────│   PostgreSQL (Supabase)    │
│   TanStack Query      │  JSON  │                            │
└─────────────────────┘        └──────────────────────────┘
                                              ▲
                                              │  (not yet connected)
                                 ┌────────────┴─────────────┐
                                 │ packages/knowledge-engine/  │
                                 │ offline data/pipelines,     │
                                 │ no runtime link to app/     │
                                 └──────────────────────────┘
```

## `web/` — Frontend

Next.js 16 App Router, React 19. Auth is **Supabase Auth** (`@supabase/ssr`): `supabase.auth.signInWithPassword`/`signUp` run directly against Supabase from Server Actions; session cookies are owned entirely by the Supabase SSR helper, not hand-rolled. Route protection is enforced in `src/app/(app)/layout.tsx` (redirects to `/login` if there's no session) — `proxy.ts` (Next 16's renamed middleware) only refreshes the Supabase session, it does not gate routes itself.

Two ways `web/` talks to `app/`, both attaching `Authorization: Bearer <supabase access_token>`:
1. **Server Actions / Server Components** (the default) call `app/`'s REST API directly via `src/lib/api.ts`.
2. **Interactive Client Components** (currently just the Estimate Builder) go through a same-origin catch-all proxy (`/api/proxy/[...path]`) so the token never has to reach browser JS. A second, binary-safe proxy (`/api/documents/[...path]`) exists specifically for PDF downloads.

One backend call is domain-specific rather than pure auth: `signupAction` calls Supabase to create the auth user, then calls the backend's `POST /api/v1/auth/bootstrap` to attach the org/user record on the TradeOS side — Supabase owns identity, `app/` owns the org/tenant model.

## `app/` — Backend

Express + Prisma against PostgreSQL, multi-tenant via forced row-level security. Every `/api/v1/*` request runs inside a Prisma transaction with transaction-local `app.user_id`/`app.org_id`/`app.role` Postgres settings (`app/db/requestSession.ts`), so RLS policies enforce the tenant boundary in the database itself, not just in application code. Background jobs (e.g. the supplier-price-sync worker) get their own scoped session via `runWithBackgroundDatabaseSession` rather than bypassing RLS.

17 modules under `app/modules/` each own one business domain (cost/labor/material/equipment/assemblies databases, estimate engine, proposal generator, change orders, proposals/invoices/contracts, supplier database/integration, project intake, organization provisioning, auth, admin dashboard) and are Express-agnostic — `app/backend/` is a thin HTTP adapter over them.

Database schema/migrations are the single source of truth via Prisma Migrate (`app/prisma/migrations/`); `scripts/deploy-migrations.sh` applies them plus (re)provisions a restricted `tradeos_app` Postgres role, and is the one path used by local dev, the integration test suite, and the GitHub Actions rollout workflow — no separate hand-written SQL exists outside this.

## `packages/knowledge-engine/` — Offline Knowledge Factory (not yet connected)

A file-based, Python/prompt-driven pipeline for generating and curating cost-item and assembly data — entirely separate from the running application. It has its own generation agents, JSON Schemas, a batch review/approval workflow, and export scripts (`pipelines/export/publish_to_supabase.py`) intended to eventually push curated data into a Supabase-backed database.

**Today, nothing in `app/` or `web/` reads from it.** It has no `package.json` and is not an npm workspace member. Its JSON Schemas describe cost items/assemblies in a flat shape (combined labor/material/equipment cost fields, no relational IDs) that does not match `app/prisma/schema.prisma`'s fully relational `CostItem`/`Assembly` models (separate `LaborRate`/`Material`/`Equipment` foreign keys, org-scoped, `isTemplate` flag, etc.). Connecting the two requires an explicit mapping/ETL layer — see `docs/KNOWLEDGE_ENGINE_STATUS.md` and `INTEGRATION_PLAN.md` in `packages/legacy-tradeos-reference/` for the originally-scoped phases (workspace setup → schema alignment → TS service wrapper → sync/seed pipeline), none of which have started.

The forward-looking `AI_ESTIMATING_ARCHITECTURE.md` design (a Photos→Voice→Scope→Retrieval→...→Closeout pipeline) was written the same day the knowledge engine was imported and does not yet account for it — the retrieval/reasoning/assemblies content already present under `packages/knowledge-engine/knowledge/knowledge/{retrieval,reasoning,assemblies}` is directly relevant to that design's "Knowledge Engine and RAG strategy" section and should be reconciled with it rather than rebuilt from scratch.

## Data flow today vs. planned

| Path | Status |
|---|---|
| Browser ↔ `web/` ↔ `app/` ↔ Supabase Postgres | **Live** — full CRUD, estimating, proposals/invoices/contracts, AI-assisted intake |
| `app/` supplier price sync (external feed → queue → admin approval → live price) | **Live plumbing, stub feed** — queue/review/audit/worker/scheduler all real and RLS-enforced; the actual feed fetcher returns no quotes (no real supplier API integrated yet) |
| `packages/knowledge-engine` generation pipeline → curated data → `app/` database | **Not connected** — pipeline produces `exports/json/costbook.json`/`exports/sql/sync_final.sql`, but nothing imports these into the live schema |
| AI estimating pipeline (Photos→Voice→...→Closeout) | **Design only** — `project-intake` module (classifier, confidence scoring) is the one piece actually implemented; the rest of the pipeline described in `AI_ESTIMATING_ARCHITECTURE.md` is unbuilt |
