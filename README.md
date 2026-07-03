# TradeOS Cost Book

A cloud-based estimating and pricing system for trade contractors (general construction, remodeling, decks, roofing, concrete, excavation, landscaping, fencing, plumbing, HVAC, electrical).

## Planning Documents

- [`docs/TradeOS-CostBook-Architecture.docx`](docs/TradeOS-CostBook-Architecture.docx) — full architecture, formulas, database design, V1 category content, pricing-update strategy, roadmap, and competitive analysis.
- [`docs/TradeOS-CostBook-Wireframe-Module-Spec.docx`](docs/TradeOS-CostBook-Wireframe-Module-Spec.docx) — MVP wiretree/sitemap, page-by-page UI annotations, primary user flows, and a detailed spec for all 12 system modules.

## Code

The MVP backend (Phase 1) is implemented in [`app/`](app/) — see [`app/README.md`](app/README.md) for setup, migrations, seeding, and how to run the core estimate → proposal loop end-to-end. It is a Node.js/TypeScript/Express API backed by PostgreSQL/Supabase via Prisma, implementing the Cost Database, Labor Database, Material Database, Equipment Database, Assemblies Database, Estimate Engine, Proposal Generator, and Admin Dashboard modules. A lightweight internal admin page for membership history is also available at `/admin/member-history`.

The Next.js front-end in [`web/`](web/) — see [`web/README.md`](web/README.md) for setup — now covers auth (via Supabase), customer/project CRUD, the Estimate Builder, Proposal/Invoice/Contract workflows, and an AI-assisted site-visit intake page, against [`docs/frontend-platform-completion-plan.md`](docs/frontend-platform-completion-plan.md).

Legacy Costbook/Swift reference assets have been migrated into [`packages/`](packages/) — see [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) and [`docs/LEGACY_ASSET_MIGRATION_STATUS.md`](docs/LEGACY_ASSET_MIGRATION_STATUS.md) for what's integrated vs. reference-only.

## Structure

```
.github/workflows/deploy-migrations.yml   CI/CD entry point for production migration rollout
docs/                                 Planning, architecture, audit, and status documents (see docs/REPOSITORY_STRUCTURE.md)
app/                                  MVP backend — Express API, Prisma schema, module services, tests
  backend/                             Routes, controllers, middleware, auth (renamed from api/)
  db/                                  Prisma client singleton, seed script
  modules/                            One folder per core module (types.ts + service.ts)
  prisma/schema.prisma                 ORM schema
  prisma/migrations/                   Tracked migration history (source of truth for schema + RLS)
  scripts/deploy-migrations.sh         Production migration rollout automation
  tests/                                Jest test suite
web/                                  Next.js (App Router) front-end — Supabase auth, CRM, Estimate Builder, AI intake
packages/
  knowledge-engine/                    Legacy costbook data, generation pipelines, prompts, review workflows (reference-only, not yet wired into app/web — see docs/KNOWLEDGE_ENGINE_STATUS.md)
  legacy-tradeos-reference/            Transfer-planning docs for the knowledge-engine migration (historical reference)
```

## Status

See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the current, audited state of every part of this repo, and [`docs/EXECUTIVE_REPOSITORY_AUDIT.md`](docs/EXECUTIVE_REPOSITORY_AUDIT.md) for the latest full audit summary and recommended next sprint.

Backend (Phase 0/1 of the original MVP roadmap) is implemented: bearer-token auth (including real email/password sign-up/sign-in), organization membership checks, request-scoped database sessions, forced PostgreSQL RLS policies, and Proposal/Invoice/Contract entities with status lifecycles. A Next.js front-end now exists in `web/` covering auth, CRM, estimating, and document workflows end-to-end. See `docs/frontend-platform-completion-plan.md` for the remaining front-end/CRM/AI roadmap and `app/README.md` for backend deployment details.
