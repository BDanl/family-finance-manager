# SDD 01 — Product requirements

## Product
**Family Finance Manager**: a responsive web application for a household to record, understand, and plan its shared and personal finances.

## Problem statement
Families often track expenses across notes, spreadsheets, and individual accounts. This app centralizes household income, expenses, budgets and goals with clear ownership, permissions, and shared reporting.

## Users and roles
- **Owner**: creates household, manages members and settings, full household administration.
- **Admin**: manages categories, budgets, goals and household settings (cannot transfer ownership unless explicitly implemented).
- **Member**: records and views shared finances; may access personal entries according to visibility rules.
- **Viewer (optional MVP)**: read-only access.

## Core principles
- Privacy-first and least privilege.
- Simple data entry and clarity over financial jargon.
- Responsive, accessible, mobile-first UI.
- No bank credential collection, scraping, or automatic bank linking in MVP.
- No financial, investment, tax or lending advice.

## MVP features
1. **Authentication**: sign up, sign in, sign out, password recovery; optional email verification.
2. **Households**: create a household; invite member by email through a secure flow; roles; member removal.
3. **Transactions**: create, edit, delete (soft-delete preferred), list and filter income/expense/transfer; date, amount, currency, category, account, note, author and visibility.
4. **Accounts**: cash, checking, savings, credit card and other manually tracked account types; opening balance; current balance calculated or reconciled.
5. **Categories**: customizable income and expense categories; category icon/color metadata; category defaults.
6. **Budgets**: monthly category budgets; actual vs budget; progress indicators and overspend state.
7. **Dashboard**: current-month income, expenses, net cash flow, budget overview, recent transactions, simple charts.
8. **Goals**: savings targets, target amount, current contribution and optional target date; contribution tracking.
9. **Recurring items**: recurring income/expense template with cadence; MVP creates templates and supports user-confirmed generation rather than unattended processing.
10. **Reports**: date range summary, category breakdown, account balances and CSV export.
11. **Settings**: household name, timezone, locale and currency/display preferences.
12. **Audit trail**: record who created/edited/deleted key financial records, without logging secret or unnecessary payload details.

## Visibility model
- Household-wide records are shared with all permitted members.
- Personal/private records may be introduced only if implemented consistently across transactions, accounts, reports and budgets. For MVP, default all records to household-shared and allow private records only after explicit design approval.
- All member access must be scoped to a household they belong to.

## Non-goals for MVP
- Bank synchronization/open banking.
- Payment execution or money movement.
- Financial advice, investment recommendations or tax calculations.
- Multi-household cross aggregation.
- Receipt OCR or AI categorization (future).
- Native mobile apps.

## User stories
- As a member, I can record an expense quickly with amount, date and category.
- As a member, I can see household monthly spending and remaining budget.
- As a member, I can see income and expense history and filter it.
- As an admin, I can create categories and budgets.
- As a household owner, I can invite or remove household members.
- As a member, I can create a savings goal and track contributions.
- As a member, I can export records I am authorized to access.

## Functional requirements
- Monetary values must be represented using a fixed precision decimal type, not binary floating-point arithmetic.
- Transactions must have positive amounts; type determines income, expense or transfer semantics.
- Transfers between accounts must be represented as a paired operation or a dedicated transfer entity to avoid double-counting cash flow.
- Timezone-aware dates; financial transaction date is a local calendar date.
- Filters: date range, type, account, category and creator (subject to permission).
- Reports and exports must respect authorization and household scope.
- Empty, loading, error and success states must exist for all major screens.

## Non-functional requirements
- Security: RLS, secure auth, input validation and authorization testing.
- Performance: dashboard queries designed to avoid unbounded scans; pagination for transaction lists.
- Reliability: migration-based schema, automated checks and backups managed by the hosting platform.
- Accessibility: keyboard navigation, contrast, semantic labels, screen-reader-friendly feedback.
- Maintainability: typed code, service layer, tests, documented migrations.
- Responsive design: small phones through desktop.
