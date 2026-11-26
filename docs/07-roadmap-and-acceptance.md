# SDD 07 — Roadmap and acceptance

## Milestone 0 — Bootstrap
- Scaffold React/TypeScript/Vite.
- Configure lint, formatting, type checks and test framework.
- Add environment validation and Supabase client.
- Add routes, shell layout and placeholder pages.
**Acceptance:** project builds, checks pass, preview deployment works, no secrets committed.

## Milestone 1 — Auth and household
- Auth pages and session handling.
- Household creation and membership.
- Role model and onboarding.
- RLS policies and authorization tests.
**Acceptance:** users can create/sign into a household; one user cannot access another household's rows; viewer cannot mutate.

## Milestone 2 — Accounts and categories
- Account CRUD/archive.
- Household category CRUD/defaults.
- Balance semantics documented and tested.
**Acceptance:** create account/category; data persists; cross-household references blocked.

## Milestone 3 — Transactions
- CRUD, pagination, filters, validations.
- Transfer design and atomic workflow (if scope allows).
- Audit events.
**Acceptance:** records persist; reports handle transaction types; permissions enforced; deletion preserves audit/retention requirements.

## Milestone 4 — Dashboard and budgets
- Monthly dashboard and category budgets.
- Aggregate queries, chart and textual summaries.
**Acceptance:** calculations match fixtures; no unauthorized data included; month boundaries tested.

## Milestone 5 — Goals and recurring templates
- Goals, contributions and progress.
- Recurring templates with user-confirmed creation.
**Acceptance:** contributions are ledgered and progress calculated; recurring items never silently create transactions in MVP.

## Milestone 6 — Reports and export
- Date range report, category/account breakdown and CSV.
- Export permissions and formula-injection defense.
**Acceptance:** export matches authorized filters and cannot leak household data.

## Milestone 7 — Hardening and launch
- Security review, accessibility review, performance and responsive test.
- Deployment runbook, privacy/deletion process, production environment.
**Acceptance:** all checks pass, no high severity findings, backup/restore plan documented, production smoke tests completed.

## Definition of done for each milestone
- Acceptance criteria fulfilled.
- Tests added and passing.
- Type checks and lint pass.
- Security/privacy implications reviewed.
- Documentation and migrations updated.
- Diff reviewed; no secrets or accidental data included.
- Devin reports verified evidence and remaining issues.
