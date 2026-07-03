# Knowledge Engine Runtime Integration

## Summary

TradeOS now has a read-only runtime bridge from the live backend into the migrated Knowledge Engine package at `packages/knowledge-engine/`.

The runtime loads source files directly from disk and exposes deterministic read APIs for search and scope matching without writing to Prisma, Supabase, or the Knowledge Engine package.

## What is integrated

Backend module:

- `app/modules/knowledge-runtime/loader.ts`
- `app/modules/knowledge-runtime/cache.ts`
- `app/modules/knowledge-runtime/repository.ts`
- `app/modules/knowledge-runtime/matcher.ts`
- `app/modules/knowledge-runtime/service.ts`

Loaded into searchable assemblies/cost items:

- `packages/knowledge-engine/exports/json/costbook.json` (289 assemblies, 1,795 cost items)
- `packages/knowledge-engine/knowledge/knowledge/assembly-index.json` (4 trade-group summary entries)
- `packages/knowledge-engine/knowledge/knowledge/trade-progress.json` (25 trades)
- `packages/knowledge-engine/knowledge/knowledge/trade-taxonomy/taxonomy.md` (keyword text only)

Inventoried for stats only, **not parsed into search or matching**:

- `packages/knowledge-engine/knowledge/knowledge/assemblies/**/*.json` (recursively, including per-trade subfolders such as `tree-service/`, `roofing/`)
- `packages/knowledge-engine/knowledge/knowledge/cost-items/**/*.json` (recursively, same per-trade subfolders)
- `packages/knowledge-engine/schemas/*.json`

See "What remains disconnected" below — the per-trade files carry materially richer content (proposal language, risk factors, permit/inspection awareness, safety requirements) than what made it into `costbook.json`, and none of it currently reaches search or scope matching.

Read-only API surface:

- `GET /api/v1/knowledge/stats`
- `GET /api/v1/knowledge/trades`
- `GET /api/v1/knowledge/search`
- `POST /api/v1/knowledge/match`

Compatibility aliases retained:

- `GET /api/v1/knowledge/assemblies/search`
- `GET /api/v1/knowledge/cost-items/search`
- `POST /api/v1/knowledge/match-scope`

Frontend wiring:

- `web/src/app/(app)/projects/[id]/estimates/[estimateId]/assist/page.tsx`
- `web/src/components/estimate-assist/ai-estimate-assist.tsx`
- `web/src/lib/api.ts`

The assist page now uses live runtime data for:

- trade count
- assembly count
- cost item count
- trade list
- search
- deterministic scope matching
- confidence
- assumptions
- missing information
- review warnings

## Deterministic match output

Given plain-English scope text, the matcher returns:

- detected trade
- matching assemblies
- matching cost items
- confidence score
- assumptions
- missing information
- review warnings
- rationale

Trade detection stays aligned with the existing `project-intake` classifier so the runtime does not fork TradeOS decision logic.

## Read-only guarantees

- No Prisma schema changes
- No Knowledge Engine package mutation
- No Supabase import
- No vector search, pgvector, or RAG
- No external AI calls
- No automatic estimate writes

## What remains disconnected

The Knowledge Engine is still a file-backed runtime source, not an application-managed database domain.

Still intentionally disconnected:

- versioned import pipeline into app-managed tables
- write-path feedback logging for accepted or rejected matches
- estimate line-item creation from approved runtime matches
- historical estimate retrieval or cross-project pattern mining
- proposal/prose generation from runtime assumptions

Also currently disconnected, found during a QA audit (not by design, unlike the list above):

- The per-trade files under `knowledge/knowledge/assemblies/<trade>/*.json` and `knowledge/knowledge/cost-items/<trade>/*.json` (e.g. `tree-service/stump-grinding.json`, `tree-service/climber-arborist-labor.json`) are recursively counted for `stats.sourceFileCount` but their content is never parsed into a `KnowledgeAssemblyRecord`/`KnowledgeCostItemRecord`. Search and scope matching only ever see `costbook.json` and `assembly-index.json`. For scopes like the tree-removal sample below, this means a purpose-built "Stump Grinding" assembly (with its own proposal scope-of-work, warranty language, and permit awareness) sits on disk unused while the runtime instead surfaces a generic assembly-index stub.

## Known limitations

- Matching is deterministic and keyword-heavy, so ambiguous scopes still require human review.
- Quantity extraction is shallow and only looks for obvious measurements and count cues in free text.
- The runtime is process-memory cached, so file changes require process restart or cache reset in tests.
- Some trades have stronger assembly coverage than others because the migrated package is still uneven across categories.
- Generic verbs/nouns that recur across many unrelated cost-item and assembly descriptions (e.g. "remove", "oak" as in hardwood flooring) can still surface as low-relevance matches alongside the correct top match, since the matcher scores on any keyword overlap rather than domain-specific discrimination. The detected trade and top-ranked result are still correct in the samples tested; the noise shows up further down a same-request result list. True stopwords (see next point) were fixed outright since they carried zero signal; these merely-common domain words were left alone because filtering them risks hiding legitimate matches for scopes that genuinely are about "removal" or specific materials.
- (Fixed this pass, noted for visibility) The keyword tokenizer previously treated common English function words (e.g. "and", "the", "with") as matched keywords, which could inflate confidence scores and showed up verbatim in user-facing rationale text (e.g. "Matched X on concrete, driveway, broom, **and**, haul, away"). A small stopword filter now excludes these from both indexed and query keywords.
- (Fixed this pass) `stats.sourceFileCount` under-counted the per-trade knowledge files because the directory listing used for it did not recurse into subdirectories. It now walks recursively, so the count reflects what is actually on disk, even though (see above) that content still isn't loaded into search.

## Recommended next roadmap

1. Add an explicit cache-refresh strategy for long-running backend processes.
2. Log estimator acceptance and rejection decisions without enabling any write path into the Knowledge Engine itself.
3. Design a versioned import boundary before any database-backed knowledge workflow is introduced.
4. Connect approved runtime matches to existing estimate line-item add flows as a separate reviewed action.
5. Decide how the per-trade `knowledge/assemblies/<trade>/*.json` and `knowledge/cost-items/<trade>/*.json` files should relate to `costbook.json` (supersede it per trade, merge/dedupe by id, or stay as a separate richer-detail lookup keyed off a matched record), then parse and index them — this is the single highest-value gap found in this audit, since the richer per-trade content (proposal language, safety/permit/warranty notes) is exactly what a deterministic estimating assistant should be surfacing.
6. Note for future audits: `/api/v1/knowledge/*` currently sits behind the same `requireAuth` + `databaseSession` middleware chain as every other `/api/v1/*` route (see `app/backend/server.ts`), even though this module never touches Prisma. That means a knowledge lookup opens a real RLS database transaction it doesn't need and will fail if the database is unreachable, despite being purely file-backed. Out of scope to change here (outside `app/modules/knowledge-runtime/`), but worth deciding deliberately rather than leaving as an accident of route mounting order.
