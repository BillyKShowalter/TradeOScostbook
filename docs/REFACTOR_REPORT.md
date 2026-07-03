# Refactor Report

Scope: `app/` (Express/Prisma backend) and `web/` (Next.js frontend). No features were added or changed; every change below is behavior-preserving and verified by the existing build/lint/test suites plus, for the frontend, `next build`.

Method: static analysis with `knip` (unused files/exports/dependencies) in both `app/` and `web/`, cross-checked by hand with `grep`/`git diff` against every candidate before touching it (knip has false positives — e.g. files driven only by shell scripts or npm scripts rather than imports — those were left alone; see "Not changed" below).

Verification after every change: `npm run build`, `npm run lint`, `npm test` (backend, 249/249 passing across 33 suites) and `npm run build`, `npm run lint` (frontend, Next.js production build).

## 1. Duplicate code removed

### `round2` was defined identically five times
`modules/estimate-engine/formulas.ts`, `modules/estimate-engine/service.ts`, `modules/change-orders/service.ts`, `modules/cost-database/service.ts`, and `modules/assemblies-database/service.ts` each had their own private, byte-for-byte identical copy:
```ts
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
```
`formulas.ts` already exported one copy (and is explicitly documented there as "Pure pricing formulas shared across modules"). The other four modules now import `round2` from `estimate-engine/formulas` instead of redefining it — two of them (`cost-database`, `estimate-engine/service.ts`) already imported other functions from that same file, so this just adds one name to an existing import line. Zero behavior change; covered by each module's existing unit tests plus `estimate-engine.formulas.test.ts`.

## 2. Dead code removed

### Frontend: an unwired "AI intake suggestions" sub-feature
`components/intake/ai-suggestions-panel.tsx` and the `AIAnswerCard` it rendered (`components/intake/ai-answer-card.tsx`) were never imported by the actual intake page (`app/(app)/projects/[id]/intake/page.tsx`), which uses a different, already-wired set of intake components (`ai-question-card`, `ai-missing-information-panel`, etc.). Deleted both files as a pair (they only referenced each other).

Along the same lines, three unused type exports in `components/intake/types.ts` (`AIQuestion`, `AIAnswer`, `AISuggestion`) were removed — nothing imported them; the components that render questions/answers define their own local prop types instead. `AIConversationItem`, which is actually used by `ai-chat-panel.tsx`, was left in place.

### Frontend: an unwired project-files wrapper
`components/projects/project-files-panel.tsx` was a thin, never-imported wrapper around `ProjectPhotoPanel` (which is used directly by the intake page instead). `components/projects/workspace-types.ts` (a `ProjectWorkspaceData` interface) had no importers anywhere. Both deleted.

### Frontend: two unused shadcn primitives
`components/ui/checkbox.tsx` and `components/ui/select.tsx` (both `@base-ui/react`-backed shadcn primitives) are not imported anywhere — the app's actual forms use a native `<input type="checkbox">` and a hand-rolled `SelectField` wrapper around a native `<select>` instead. Deleted both. `@base-ui/react` itself is still needed (used by `badge`/`button`/`input`), so it was kept.

### Frontend: a leftover Supabase browser client
`lib/supabase/client.ts` (a `@supabase/ssr` browser client) had no callers — every Supabase call in the app goes through the server-side client (`lib/supabase/server.ts`, used by Server Actions/Components) or the middleware client (`lib/supabase/proxy.ts`). Deleted the file. `@supabase/supabase-js` (a separate, redundant package never imported anywhere — the app only uses `@supabase/ssr`) and `lucide-react` (its only two call sites were the now-deleted `checkbox.tsx`/`select.tsx`) were removed from `package.json`/`package-lock.json`.

### Frontend: dead auth API wrappers from a superseded auth flow
`lib/api.ts` exported `signup()`, `login()`, and an `AuthSession` interface that called the backend's `/api/v1/auth/signup` and `/api/v1/auth/login` REST endpoints directly. Auth in `web/` has since moved to calling Supabase Auth directly from Server Actions (`app/actions/auth.ts`, via `supabase.auth.signUp`/`signInWithPassword`, then a separate `/api/v1/auth/bootstrap` call) — nothing in `web/` calls `signup`/`login`/`AuthSession` anymore. Removed all three. (The backend's own `/api/v1/auth/signup` and `/login` routes were **not** touched — removing backend API surface is a separate, larger decision than removing a dead frontend wrapper that happens to call it, and this task was scoped to safe cleanup, not API-contract changes.)

Also removed `listProposalsByProject`, `listInvoicesByProject`, and `listContractsByProject` from `lib/api.ts` — the project detail page reads `project.proposals` (and equivalent nested collections) directly off the `getProject()` response instead, so these standalone by-project fetchers had no remaining callers.

## 3. Unnecessary exports narrowed (no behavior change)

A few functions/types were exported but only ever used inside their own file — nothing outside the file imported them. Left the implementation untouched and just dropped the `export` keyword so the module's public surface reflects what it's actually used for:
- `mapPrismaKnownRequestError` (`backend/middleware/errorHandler.ts`) — used only by `errorHandler` in the same file.
- `CreateOrganizationInput` (`modules/admin-dashboard/types.ts`) — only used to derive `UpdateOrganizationInput` via `Partial<>` in the same file. (Organization creation itself now lives entirely in `modules/organization-provisioning`, not this module — the exported name was a leftover from before that split.)
- `SupplierPriceUpdateStatus` and `SupplierFeedQuote` (`modules/supplier-integration/types.ts`) — both only referenced elsewhere in the same file.
- `ProjectStatus` (`web/src/lib/api.ts`) — only used to type `Project.status` in the same file.
- `ClientApiError` (`web/src/lib/clientApi.ts`) — thrown internally by `clientFetch` in the same file; no caller catches it by type.

## 4. File naming

### `claude.md` → `CLAUDE.md`
The repo root had both `claude.md` and `CLAUDE.md` — on this machine's case-insensitive filesystem they are literally the same inode (confirmed via `stat`), but git tracked only the lowercase name (`git ls-files` showed `claude.md`). Claude Code's own convention (and this project's tooling) reads `CLAUDE.md`. On a case-sensitive filesystem (any Linux CI runner, most Docker images) only the git-tracked casing exists on disk, so `CLAUDE.md` would silently not be found even though it works locally on macOS. Renamed the tracked file to `CLAUDE.md` via `git mv` and fixed the one internal link in the file's own changelog that pointed at the old lowercase path.

No other case-only filename collisions exist elsewhere in the repository (checked via a full case-folded listing of `git ls-files`).

## 5. Considered but not changed

- **Per-module `assertExists`/`assertDraft` helpers** (`cost-database`, `material-database`, `labor-database`, `equipment-database`, `supplier-database`, `assemblies-database`, `change-orders` services) all follow the same three-line shape (`findFirst` by id/org, throw `ApiError(404, ...)` if missing) but each hits a different Prisma model and a different entity name in its error string — this is parallel structure, not copy-pasted duplication like `round2` was. Generalizing it would mean a generic helper parameterized over which Prisma delegate to call, which trades a small amount of repetition for a real increase in type-checking complexity across seven call sites, for no behavior change. Left as-is.
- **PDF rendering boilerplate** (`modules/contracts/pdf.ts`, `modules/invoices/pdf.ts`, and the PDF paths in `modules/proposal-generator/service.ts`) share a similar "new `PDFDocument`, collect chunks into a Promise" wrapper and a similar (but not identical — proposal-generator's header is a distinct, more elaborate styled design) letterhead block. Consolidating this is plausible future work, but none of the three have byte-level/snapshot test coverage of their actual rendered output, so verifying "no visual regression" would require manually generating and eyeballing PDFs rather than relying on the test suite — more risk than this pass's "safe refactors only" mandate should take on.
- **`proposalGeneratorRouter` and `proposalsRouter`** are both mounted at `/api/v1/proposals` in `backend/server.ts`. This looks confusing at a glance, but it's deliberate and already documented in-line (`proposalGenerator.routes.ts`'s own comment): the ad-hoc, non-persisted PDF-preview route lives under `/preview/:id` specifically to avoid colliding with the persisted `Proposal` resource's `/:id` routes. Renaming either router would change public API paths, which is out of scope for a dead-code/duplication pass.
- **`docs/rolling-todo.md`, `docs/end-of-session-note.md`, `docs/compressed-session-handoff.md`** look like overlapping "session state" docs, but `CLAUDE.md`'s own Session Rules explicitly designate the first two as the project's working handoff mechanism between sessions. Restructuring them is a process change for the user to decide on, not a code refactor.
- **shadcn-generated UI primitives** (`badgeVariants`, `CardFooter`, `CardAction` in `web/src/components/ui/`) are flagged as unused exports by `knip`, but they're part of the standard generated component API shadcn ships (e.g. every `Card` usually exports `CardFooter`/`CardAction` alongside `CardContent`/`CardHeader` whether or not the current UI happens to use all of them yet). Removing library-generated boilerplate that a future `shadcn add`/upgrade would simply regenerate isn't a meaningful simplification, so these were left alone.
- **`knip`'s "unused files" flags for `.claude/skills/run-tradeos-costbook-api/driver.mjs`, `jest.integration.config.js`, and `tests/rls.integration.ts`** are false positives — all three are invoked via shell/npm scripts (`npm run test:integration`, the `run-tradeos-costbook-api` skill) rather than imported from other TypeScript files, which is outside what an import-graph tool can see. Confirmed each is genuinely wired up before ruling them out.

## Verification summary

| Check | Result |
|---|---|
| `app/` — `npm run build` | pass |
| `app/` — `npm run lint` | pass |
| `app/` — `npm test` | 249/249 passing, 33 suites |
| `web/` — `npm run build` (`next build`) | pass, all 20 routes compiled |
| `web/` — `npm run lint` | pass |
| `knip` re-run on both projects | no remaining unused files/dependencies; only the intentionally-kept shadcn exports remain flagged |

## Files touched

```
 CLAUDE.md                                   (renamed from claude.md; one internal link fixed)
 app/backend/middleware/errorHandler.ts      (un-export mapPrismaKnownRequestError)
 app/modules/admin-dashboard/types.ts        (un-export CreateOrganizationInput)
 app/modules/assemblies-database/service.ts  (round2 -> shared import)
 app/modules/change-orders/service.ts        (round2 -> shared import)
 app/modules/cost-database/service.ts        (round2 -> shared import)
 app/modules/estimate-engine/service.ts      (round2 -> shared import)
 app/modules/supplier-integration/types.ts   (un-export two internal-only types)
 web/package.json, web/package-lock.json     (drop @supabase/supabase-js, lucide-react)
 web/src/lib/api.ts                          (remove dead signup/login/AuthSession, 3 dead list-by-project fns)
 web/src/lib/clientApi.ts                    (un-export ClientApiError)
 web/src/components/intake/types.ts          (remove 3 unused interfaces)
 web/src/components/intake/ai-answer-card.tsx        (deleted)
 web/src/components/intake/ai-suggestions-panel.tsx  (deleted)
 web/src/components/projects/project-files-panel.tsx (deleted)
 web/src/components/projects/workspace-types.ts      (deleted)
 web/src/components/ui/checkbox.tsx                  (deleted)
 web/src/components/ui/select.tsx                    (deleted)
 web/src/lib/supabase/client.ts                      (deleted)
```
