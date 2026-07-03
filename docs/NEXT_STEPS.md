# Next Steps

Snapshot as of **2026-07-03**. See [`docs/CURRENT_SPRINTS.md`](CURRENT_SPRINTS.md) for what Sprint 11 shipped and the recommended Sprint 12 scope, and [`docs/AGENT_HANDOFF.md`](AGENT_HANDOFF.md) for the full repo/fleet status before starting any of this.

## Immediate follow-up (before or alongside Sprint 12 feature work)

1. **Commit and reconcile Sprint 11.** The Project Workspace, Field Dashboard, task system, and Knowledge Runtime work described in `docs/CURRENT_SPRINTS.md` is sitting uncommitted in the shared working tree. Run `git status` before touching any of the affected files, and coordinate rather than committing over another agent's in-flight change.
2. **Push local `main` to `origin/main`.** Local `main` is one commit ahead of `origin/main` (`e31c1c8`, the Knowledge Engine import) — confirm this is intentional and safe to push before doing so; it has not been pushed yet.
3. Add persisted lifecycle event records so the project timeline and activity feed no longer rely only on derived timestamps from project subdomains.
4. Add project-task editing beyond status changes, including bulk completion and lightweight field-assignment filters.
5. Add change-order customer approval artifacts and signed acceptance capture on top of the current internal approval timestamps.
6. Add richer document taxonomy, signed artifact storage, and document-version visibility for plans, permits, and closeout packages.
7. Add warranty records, claim intake, and post-closeout reminders as a real backend-owned module.
8. Add AI suggestion acceptance/rejection logging so executive metrics can report a true acceptance rate instead of an instrumentation gap.

## Recommended Sprint 12

See `docs/CURRENT_SPRINTS.md` for the full breakdown. Summary:

1. Persist backend-owned activity events; use them as the source for timeline/dashboard feeds.
2. Add customer-facing change-order acceptance with signed artifact generation.
3. Introduce a first-class warranty module (claims, reminders, closeout handoff).
4. Add project-document versioning and structured metadata.
5. Instrument AI estimate suggestion review outcomes for real acceptance-rate reporting.

## What should stay out of scope

Do not start any of the following in Sprint 12 unless priorities change:

- Scheduling or dispatch workflows
- Payroll or accounting integrations
- Inventory management
- CRM redesign
- RAG or Knowledge-Runtime persistence rewrites (the runtime is deliberately file-backed and read-only)
- Broad architecture rewrites or framework migrations

## Longer-horizon / infrastructure items still open

Carried forward from prior sessions (`docs/rolling-todo.md`, `docs/end-of-session-note.md`) — still unresolved as of this snapshot:

- Required-reviewer protection on the `production` GitHub Environment still won't enable via the API even on GitHub Pro. Try the web UI (Settings → Environments → production), or check whether this needs an organization-owned repo. Until resolved, `workflow_dispatch` runs against `production` execute with no approval gate.
- The actual API application has never been deployed anywhere — only the database schema and `tradeos_app` role exist live on Supabase. Deploying the running Express process (Vercel/Fly/Railway/a VM) is unstarted.
- Configure infrastructure-level network controls around platform provisioning once a real deployment target exists.
- Add a real `SupplierFeedFetcher` once an actual supplier feed exists — CRUD API, queue/review/worker plumbing, scheduler, and error mapping are all ready to receive it.
- Seed a few more realistic common assembly templates (deck package, bathroom remodel, kitchen refresh) — only one exists today.
- `.github/workflows/deploy-migrations.yml` has only ever been exercised via `act` against the local disposable Postgres container, never against real GitHub infrastructure or a real production database. Do not treat it as verified against the actual target environment.

## Before starting new work

1. `git status` — confirm what's actually committed vs. still sitting in the shared working tree.
2. Check `gh pr list --state all` for open draft PRs from other agent worktrees that might already cover what you're about to do (see the fleet snapshot in `docs/AGENT_HANDOFF.md`).
3. Run the full verification ladder from `AGENTS.md` before and after your change.
