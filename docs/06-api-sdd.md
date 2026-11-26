# SDD 06 — API and data-access design

## Principle
MVP uses Supabase client for low-risk CRUD operations backed by RLS and database constraints. Use Edge Functions or database RPC for sensitive, multi-step or privileged operations. Avoid introducing a custom server unless justified.

## Client service modules (suggested)
- `householdService`: create household, fetch active household, members and preferences.
- `accountService`: list, create, update, archive accounts.
- `categoryService`: list and manage categories.
- `transactionService`: paginated/filterable transaction CRUD.
- `budgetService`: month budgets and actuals.
- `goalService`: goals and contribution ledger.
- `reportService`: aggregate queries, scoped exports.
- `recurringService`: templates and user-confirmed creation.

## Query contract (conceptual)
- Every query is household-scoped.
- Use server/database filters, not fetching all records to filter in browser.
- Paginate transaction history.
- Use explicit selected fields; avoid select('*') for complex sensitive queries where feasible.
- Validate all writes using Zod or equivalent and database constraints.
- Never accept client role/permission assertions as authorization.

## Sensitive RPC/Edge Function workflows
- `create_household_with_owner`: atomic household and owner membership creation.
- `accept_household_invite`: verify invite token and user identity, consume token once.
- `remove_household_member`: role validation, owner protection and audit event.
- `create_transfer`: atomic two-account transfer with balanced ledger semantics.
- `add_goal_contribution`: insert contribution and update/recompute goal progress safely.
- `export_transactions`: only if export authorization/size controls require server-side handling.

## API behavior
- Use predictable error codes and non-sensitive messages.
- Retry only safe operations.
- Prevent duplicate submissions via idempotency where applicable.
- Transactions and transfer workflows should be atomic.
- Export formats: CSV MVP; escape cells to avoid spreadsheet formula injection (values beginning with formula characters should be neutralized).
- Date filters use inclusive local date boundaries consistently.
