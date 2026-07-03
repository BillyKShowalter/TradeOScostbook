# TradeOS Cost Book — Web

Next.js (App Router) front-end for the TradeOS Cost Book API in `../app`. See `../docs/frontend-platform-completion-plan.md` for the broader plan this implements against.

## Setup

```bash
npm install
cp .env.example .env.local   # point BACKEND_API_URL at the running API
npm run dev
```

Requires the backend API (`../app`) running and reachable at `BACKEND_API_URL` (defaults to `http://localhost:4000`).
For auth and Storage-backed photo uploads, also set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and optionally `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
If the bucket is private, set `SUPABASE_STORAGE_BUCKET_PUBLIC=false` so server-rendered pages use signed URLs from `storagePath` instead of assuming public object URLs.

## Pages

- `/`, `/login`, `/signup` — public.
- `/dashboard`, `/customers`, `/customers/new`, `/customers/[id]`, `/projects`, `/projects/new`, `/projects/[id]`, `/projects/[id]/estimates/[estimateId]` — protected by `proxy.ts`, grouped under `(app)/layout.tsx` (shared nav + sign-out).
- `/projects/[id]/proposals/new`, `/projects/[id]/proposals/[proposalId]` — create a proposal from an estimate; send/accept/reject; download PDF; create a contract once accepted.
- `/projects/[id]/invoices/new`, `/projects/[id]/invoices/[invoiceId]` — create a full or progress invoice from an estimate; send/mark-paid/void; download PDF.
- `/projects/[id]/contracts/[contractId]` — view terms, sign (name/email), void; download PDF.
- `/projects/[id]/estimates/[estimateId]/assist` — org-scoped AI estimate drafting that returns reviewable line-item suggestions from the active cost book.

## Auth model

- `POST /api/v1/auth/signup` and `POST /api/v1/auth/login` (backend) are called from Server Actions in `src/app/actions/auth.ts`.
- The returned JWT is stored in an httpOnly cookie (`src/lib/session.ts`) — it never reaches client-side JS.
- `proxy.ts` (Next 16's renamed `middleware.ts`) redirects unauthenticated requests to `/dashboard`, `/customers`, or `/projects` to `/login`.

## Two ways to talk to the backend, by design

- **Server Components / Server Actions** (page loads, form submits — customer/project/proposal/invoice/contract CRUD, status changes, finalize-estimate-from-project-page) use `src/lib/api.ts` directly with the session token read server-side via `getSessionToken()`. Prefer this path; it's simpler and matches "Server Actions for mutations, Server Components for reads."
- **Client Components that need interactive, non-form mutations** (the Estimate Builder's line-item search-and-add, pricing-mode toggle, remove-line-item — things that don't fit a single form submit) use TanStack Query + `src/lib/clientApi.ts`, which calls the same-origin catch-all `src/app/api/proxy/[...path]/route.ts`. That route handler is the only thing that reads the httpOnly cookie on the client's behalf and forwards `Authorization: Bearer` to the Express API — the token never reaches browser JS either way.
- **PDF downloads** (proposal/invoice/contract) go through a *separate* catch-all, `src/app/api/documents/[...path]/route.ts`, which streams the upstream response as raw bytes (`arrayBuffer`) instead of `.text()`/JSON — the JSON proxy would corrupt binary PDF data.

## Data/state

- Server state goes through TanStack Query (`src/app/providers.tsx`) only where a page is genuinely interactive (the Estimate Builder). Everything else fetches directly in Server Components — no client-side query layer needed for a page that's just a list or a form.
- AI Estimate Assist uses the same proxy pattern as other interactive client flows, but its initial suggestion draft is loaded server-side so the page can render immediately with org-scoped context.
