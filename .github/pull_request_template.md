## Summary

<!-- Describe the user-visible or operator-visible outcome in 2-4 sentences. -->

## Scope

- Branch:
- Base branch:
- Worktree path:
- Linked issue:
- Scope type: <!-- backend / frontend / docs / governance / security / migration / mixed -->

## Required Startup Verification

- [ ] Exact worktree path verified.
- [ ] Exact branch verified.
- [ ] `git fetch origin --prune` run before branch comparison.
- [ ] Remote repository target verified.
- [ ] Upstream state reported, or missing upstream explicitly documented.
- [ ] Active worktrees reviewed for overlap.
- [ ] Open PR overlap reviewed.
- [ ] `docs/ENGINEERING_COMMAND_CENTER.md` read after environment verification.
- [ ] `docs/CURRENT_STATE.md` read.
- [ ] `docs/SESSION_HANDOFF.md` read.
- [ ] `docs/REPOSITORY_GOVERNANCE.md` read for governance or workflow changes.
- [ ] Allowed paths, forbidden paths, exclusions, and stop conditions were stated before edits.

## Change Checklist

- [ ] Changes stayed inside the stated scope.
- [ ] No unrelated cleanup, refactor, dependency upgrade, merge, or rebase was included.
- [ ] No secrets, local-only files, generated caches, or `.codex/` artifacts were committed.
- [ ] Runtime behavior changes include relevant tests.
- [ ] Tenant isolation, authorization, validation, and service-layer write paths were reviewed when backend behavior changed.
- [ ] RLS, migration, Prisma, or database changes include live integration coverage or a documented blocker.
- [ ] UI changes preserve existing design-system patterns and do not duplicate shared components.
- [ ] AI-assisted features remain review-first and do not write directly to the database outside validated service-layer tools.

## Documentation Impact

- [ ] `docs/DOC_OWNERSHIP.yml` requirements were checked.
- [ ] Required source-of-truth docs changed in this branch.
- [ ] `docs/SESSION_HANDOFF.md` was refreshed for this substantive or PR-ready session.
- [ ] `docs/ENGINEERING_COMMAND_CENTER.md` changed only because mission, priorities, blockers, CI requirements, or operating protocol changed.
- [ ] No documentation update required.

If no documentation update was required, explain why:

## Verification

- [ ] `npm run docs:check`
- [ ] `npm run docs:test`
- [ ] `cd app && npm test`
- [ ] `cd app && npm run lint`
- [ ] `cd app && npm run build`
- [ ] `cd app && npm run test:integration`
- [ ] `cd web && npm run lint`
- [ ] `cd web && npm run build`
- [ ] Other:

Exact final `git status --short --branch`:

## Environment-Blocked Checks

<!-- List blocked checks and the exact environment cause, not just "not run". -->

## Risk Review

- [ ] Branch is current with `origin/main`, or drift is documented.
- [ ] Required checks match the branch protection target in `docs/REPOSITORY_GOVERNANCE.md`.
- [ ] Known limitations and deferred work are documented below.

## Known Limitations

## Follow-Up Work
