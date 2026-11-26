# SDD 02 — Architecture

## Stack
- React + TypeScript + Vite (SPA).
- Tailwind CSS; optionally shadcn/ui, keeping accessibility and component quality.
- Supabase Auth and PostgreSQL, exposed through Supabase client and RLS-protected tables.
- Supabase Storage only for optional user-uploaded assets (MVP may omit).
- Supabase Edge Functions for sensitive workflows, invitations, exports requiring elevated access, and scheduled/privileged operations.
- Vercel for frontend deployment; serverless functions only if a need arises.
- GitHub repository and CI checks.

## Architecture
Browser UI -> typed frontend service layer -> Supabase Auth / RLS-protected data access.
Sensitive operations -> Edge Function -> authorization and validation -> database.
Vercel hosts static frontend. Supabase hosts backend resources.

## Code organization proposal
- `src/app/`: app bootstrap, routing, providers.
- `src/components/`: shared UI components.
- `src/features/<feature>/`: feature-specific components, hooks, types, services.
- `src/pages/`: page-level route components.
- `src/lib/`: client setup, utilities.
- `src/services/`: shared typed service adapters.
- `src/types/`: shared domain types (prefer feature-local types).
- `src/validation/`: schemas (Zod recommended).
- `supabase/migrations/`: database migrations.
- `supabase/functions/`: Edge Functions.
- `tests/`: test suites.

## Data flow
1. User signs in; Supabase Auth supplies session.
2. Frontend uses a publishable/anon key and session to request data.
3. PostgreSQL RLS checks membership and permission for every row.
4. Mutations validate input and authorization; use RPC or Edge Functions for multi-row atomic operations (e.g. transfers).
5. UI displays optimistic feedback only where safe; reconcile server result.

## Design decisions
- Use relational data model and FK constraints.
- Household membership is the tenant boundary.
- Household IDs are never authorization on their own; membership is verified server-side by RLS.
- Use database functions for atomic transfer and contribution operations where consistency requires.
- No business logic exclusively enforced in the UI.
- Currency amount precision and rounding rules are documented and tested.
- Date-only values use PostgreSQL `date`; timestamps use timestamptz.
- MVP supports a household's base/display currency, initially COP, but store transaction currency if multi-currency support is approved. Do not silently convert amounts without a defined FX source and policy.

## Environment variables
Frontend safe variables (Vite prefix):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or publishable key; subject to RLS)

Never expose:
- Supabase service role key
- Database password
- API secrets

## Deployment
- GitHub main branch is protected when feasible.
- Vercel connected to repository: preview deploys for branches/PRs; production deploy on main.
- Supabase environments: development and production separated. Avoid using production data during development.
- Migrations are committed and reviewed.
- Deployment checklist includes migration, RLS, env vars, smoke test, and rollback plan.
