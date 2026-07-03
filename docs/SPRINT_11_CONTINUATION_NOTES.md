# Sprint 11 Continuation Notes

## Starting state

At the start of this continuation session, the repository's working tree (not the worktree — the
main checkout at `/Users/showb/TradeOScostbook`) had substantial uncommitted work already present,
plus one commit (`e31c1c8`, "import legacy costbook data, scripts, and agent pipelines") that
existed on local `main` but had never been pushed to `origin/main`.

Because this session works in an isolated git worktree branched fresh from `origin/main`, that
combination meant the worktree initially had **neither** the uncommitted Sprint 11 work **nor**
the unpushed knowledge-engine data commit. Both were recovered before any new work started:

1. Tracked-file changes were captured as a patch (`git diff` in the main checkout) and applied
   here with `git apply`.
2. Untracked new files/directories (new modules, new docs, new components) were copied in directly.
3. The missing `e31c1c8` commit was cherry-picked onto this branch — it shares the same object
   store as the main checkout, so the commit was already available even though it wasn't in
   `origin/main`'s history yet.
4. The stashed uncommitted work was reapplied cleanly on top.

The original working directory at `/Users/showb/TradeOScostbook` was never modified — this was a
copy/recovery operation, not a move.

## Codex work detected (already done, not re-done here)

Codex's uncommitted Sprint 11 work turned out to be substantially complete, not "halfway through"
in terms of functionality — it was blocked from being verified because the knowledge-engine data
commit dependency (`e31c1c8`) wasn't present, which made 16 backend tests fail with path-resolution
errors (`Unable to locate the TradeOS repository root for Knowledge Engine loading` / `ENOENT` on
`packages/knowledge-engine/exports/json/costbook.json`). Once that commit was restored, those 16
failures disappeared with no code changes.

What Codex actually built, covering Priorities 1-5 from the mission:

- **Project Workspace** (`web/src/components/projects/project-workspace.tsx`,
  `project-workspace-tabs.tsx`): a full tabbed workspace at `/projects/[id]` with all 14 tabs named
  in the mission (Overview, Estimate History, Proposals, Contracts, Invoices, Photos, Documents,
  Site Visits, Tasks, Change Orders, Timeline, Warranty, Notes, Activity). Each tab is wired to real
  data from `getProject()`, not mock data.
- **Project Timeline**: `buildProjectActivity` (`web/src/lib/document-workflow.ts`) derives a
  chronological feed from customer/project/estimate/site-visit/proposal/contract/invoice/change-order/
  task timestamps. No separate persisted event-log table — this is documented as an intentional,
  known limitation in `docs/PROJECT_LIFECYCLE.md` and `docs/NEXT_STEPS.md`, not an oversight.
- **Site Visit UI**: the Site Visits tab shows arrival/departure, a GPS placeholder, customer notes,
  materials needed, safety notes, punch list, and confidence score, reading from the existing
  `site_visits.details_json` column (extended in the new migration, see below). Start/End visit and
  richer capture continue to live in the existing `/projects/[id]/intake` flow rather than a
  duplicate mechanism.
- **Change Order UI**: full create/list/approve/reject/line-item flow in the Change Orders tab,
  backed by real endpoints — not a placeholder. Shows cost delta, schedule impact, and approval
  history.
- **Documents/Photos/Tasks**: Photos and Documents tabs use the existing project-file model (upload,
  list, bucket by generated-vs-uploaded). Tasks is a new lightweight persisted module
  (`app/modules/project-tasks/`) with status/priority/assignee/due-date/notes and its own RLS policy,
  exposed as nested routes under `/api/v1/projects/:id/tasks` (not a standalone top-level router —
  correctly avoids a redundant route surface).
- **Backend support**: `change_orders` gained `schedule_impact_days`, `approved_at`, `rejected_at`;
  `site_visits` gained `details_json`; a new `project_tasks` table was added — all in one migration
  (`prisma/migrations/20260703110000_add_project_workspace_operations/migration.sql`) with forced RLS
  using the same `current_app_can_write()` / projects-join-inheritance pattern already established by
  the proposals/invoices/contracts migration. This is a schema change, which the mission prompt for
  this continuation session says not to do — but it was already complete, tested, and consistent with
  house style before this session started, so it was left in place rather than reverted.
- **Documentation**: `docs/PROJECT_STATUS.md`, `docs/PROJECT_LIFECYCLE.md`,
  `docs/SYSTEM_ARCHITECTURE.md`, `docs/DOCUMENT_WORKFLOW.md`, `docs/NEXT_STEPS.md`, and
  `docs/EXECUTIVE_REPOSITORY_AUDIT.md` were all added/updated and read accurately against the actual
  code — this was checked, not assumed.

Also present but outside the Sprint 11 lifecycle scope described in this session's mission (evidently
from adjacent/earlier work, left untouched since it already passes and isn't part of what was asked):
`app/modules/knowledge-runtime/`, `app/modules/ai-estimate-assist/`,
`app/modules/trainingless-estimate-demo/`, and a customer-facing `web/src/app/(app)/portal/` section.

## What was incomplete when this session started

Functionally, nothing in the Priority 1-5 list was missing or stubbed dishonestly. The only real gaps:

1. The knowledge-engine commit dependency wasn't merged in, so the test suite could not pass
   (fixed — see above).
2. `claude.md`'s detailed session log had not been updated for the Sprint 11 work (only reflects
   through the earlier "AI Estimate Assist mock UI" session). Left as a follow-up rather than
   guessing at Codex's session-by-session narrative after the fact.
3. No live end-to-end browser/API verification had been done for this slice (see Docker limitation
   below).

## Docker limitation

Docker was not used and is treated as unavailable in this environment, per instructions. This means:

- `npm run test:integration` (backend) was **not run** — skipped: Docker unavailable in this
  environment. This is the live-Postgres RLS suite; it would be the right place to confirm the new
  `project_tasks` RLS policy and `site_visits.details_json` behavior against a real database.
- No live Playwright browser run against a real running backend was performed — skipped: Docker
  unavailable in this environment (the backend's local dev flow depends on the disposable Postgres
  container). Verification was instead limited to static checks: `tsc --noEmit`, `tsc -p
  tsconfig.json`, `jest`, `next build`, and `eslint`, all of which passed.

## Verification performed (no Docker)

From `app/`:
- `npm install` (fresh, in the isolated worktree) — ok
- `npm run lint` (`tsc --noEmit`) — pass
- `npm run build` (`tsc -p tsconfig.json`) — pass
- `npm test` (`jest --runInBand`) — **274/274 tests, 40/40 suites pass** (16 tests were failing
  before the knowledge-engine commit was restored; 0 failing after)

From `web/`:
- `npm install` (fresh, in the isolated worktree) — ok
- `npm run lint` (`eslint`) — pass
- `npm run build` (`next build`) — pass, all routes compile including the full Project Workspace
  route tree

## Safe continuation plan

Given the above, this session's actual contribution is:

1. Recover Codex's uncommitted Sprint 11 work and the missing knowledge-engine commit into an
   isolated worktree without touching the original working directory.
2. Verify the already-completed Priority 1-5 slice is genuinely correct and buildable (it was).
3. Commit the recovered work in coherent, reviewable commits.
4. Document the recovery and verification here, and flag the Docker-dependent checks that still
   need to run before this is trusted in a real deployment.

No new Project Workspace/Timeline/Site Visit/Change Order/Documents-Photos-Tasks code was written
in this session — it already existed and already worked. Writing a second implementation would have
violated "do not overwrite Codex's completed work" and "do not redesign the architecture."

## Recommended next sprint

Follow `docs/NEXT_STEPS.md`'s "Recommended Sprint 12" list as-is; it was reviewed here and is
consistent with the actual repository state:

1. Persist backend-owned activity events instead of deriving the timeline from source-record
   timestamps.
2. Add customer-facing change-order acceptance and signed artifact generation.
3. Introduce a first-class warranty module with claim records and reminders.
4. Add project-document versioning and structured metadata.
5. Instrument AI estimate suggestion review outcomes for real acceptance-rate reporting.

Before any of that: run `npm run test:integration` and a live Playwright pass against a real
Postgres instance once Docker (or an equivalent Postgres) is available, specifically to exercise the
new `project_tasks` RLS policy and the `site_visits.details_json` column under forced RLS — those
paths are covered by the code and by unit tests with mocked Prisma, but not yet by a live database.
