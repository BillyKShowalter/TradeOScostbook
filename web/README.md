# TradeOS Cost Book — Web

Next.js (App Router) front-end for the TradeOS Cost Book API in `../app`. See `../docs/frontend-platform-completion-plan.md` for the broader plan this implements against.

## Setup

```bash
npm install
npm run dev
```

There is no `.env.example` in this directory yet — create `.env.local` by hand with the variables listed below (`BACKEND_API_URL` plus the `NEXT_PUBLIC_SUPABASE_*`/`SUPABASE_*` variables).

Requires the backend API (`../app`) running and reachable at `BACKEND_API_URL` (defaults to `http://localhost:4000`).
For auth and Storage-backed photo uploads, also set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and optionally `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
If the bucket is private, set `SUPABASE_STORAGE_BUCKET_PUBLIC=false` so server-rendered pages use signed URLs from `storagePath` instead of assuming public object URLs.

## Pages

- `/`, `/login`, `/signup` — public.
- `/dashboard`, `/customers`, `/customers/new`, `/customers/[id]`, `/projects`, `/projects/new`, `/projects/[id]`, `/projects/[id]/estimates/[estimateId]` — protected, grouped under `(app)/layout.tsx` (shared nav + sign-out; this layout is what enforces auth — see below).
- `/projects/[id]/intake` — AI-assisted site-visit intake (chat panel, progress indicator, measurements, missing-info panel).
- `/projects/[id]/proposals/new`, `/projects/[id]/proposals/[proposalId]` — create a proposal from an estimate; send/accept/reject; download PDF; create a contract once accepted.
- `/projects/[id]/invoices/new`, `/projects/[id]/invoices/[invoiceId]` — create a full or progress invoice from an estimate; send/mark-paid/void; download PDF.
- `/projects/[id]/contracts/[contractId]` — view terms, sign (name/email), void; download PDF.

## Auth model

Auth is **Supabase Auth** (`@supabase/ssr`), not a hand-rolled JWT-in-cookie scheme:

- `src/app/actions/auth.ts`'s `loginAction` calls `supabase.auth.signInWithPassword` directly. `signupAction` calls `supabase.auth.signUp`, then calls the backend's `POST /api/v1/auth/bootstrap` to attach the org/user record. Neither goes through the backend's `/api/v1/auth/signup`/`/api/v1/auth/login` — the `signup()`/`login()` helpers still exported from `src/lib/api.ts` that call those routes are unused by the current auth flow (dead code left over from before the Supabase migration; worth removing or wiring up deliberately).
- `src/lib/session.ts` doesn't set any cookie itself — it reads the Supabase session/user (`supabase.auth.getSession()` / `.getUser()`) via `@supabase/ssr`, which owns cookie persistence (`src/lib/supabase/{server,client}.ts`).
- `proxy.ts` (Next 16's renamed `middleware.ts`) only refreshes the Supabase session cookie (`updateSession()` in `src/lib/supabase/proxy.ts`) — it does **not** redirect unauthenticated users. The actual auth gate is `src/app/(app)/layout.tsx`, which calls `getSession()` and `redirect("/login")` if there's none.

## Two ways to talk to the backend, by design

- **Server Components / Server Actions** (page loads, form submits — customer/project/proposal/invoice/contract CRUD, status changes, finalize-estimate-from-project-page) use `src/lib/api.ts` directly with the session token read server-side via `getSessionToken()`. Prefer this path; it's simpler and matches "Server Actions for mutations, Server Components for reads."
- **Client Components that need interactive, non-form mutations** (the Estimate Builder's line-item search-and-add, pricing-mode toggle, remove-line-item — things that don't fit a single form submit) use TanStack Query + `src/lib/clientApi.ts`, which calls the same-origin catch-all `src/app/api/proxy/[...path]/route.ts`. That route handler is the only thing that reads the httpOnly cookie on the client's behalf and forwards `Authorization: Bearer` to the Express API — the token never reaches browser JS either way.
- **PDF downloads** (proposal/invoice/contract) go through a *separate* catch-all, `src/app/api/documents/[...path]/route.ts`, which streams the upstream response as raw bytes (`arrayBuffer`) instead of `.text()`/JSON — the JSON proxy would corrupt binary PDF data.

## Data/state

- Server state goes through TanStack Query (`src/app/providers.tsx`) only where a page is genuinely interactive (the Estimate Builder). Everything else fetches directly in Server Components — no client-side query layer needed for a page that's just a list or a form.
