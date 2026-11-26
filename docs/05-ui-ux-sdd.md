# SDD 05 — UI/UX

## UX direction
Warm, calm, trustworthy, approachable, not bank-corporate. Use a clear hierarchy, simple terminology, restrained color, and mobile-first layouts. Avoid gamification that shames users for overspending.

## Main navigation
- Overview
- Transactions
- Accounts
- Budgets
- Goals
- Reports
- Household settings

Mobile: bottom navigation for 4–5 primary sections; secondary items in menu.

## Screens
1. **Authentication**: sign-in, registration, password recovery.
2. **Onboarding**: create household, choose name/currency/locale, create first account, seed categories, invite family optionally.
3. **Overview**: month selector; income, expenses, net; budget status; recent activity; goal cards; category breakdown.
4. **Transactions**: paginated list; filters; add/edit modal or page; CSV export; validation and confirmation.
5. **Transaction form**: type, amount, date, account, category, description, notes.
6. **Accounts**: list, balances, type, currency, archive; account detail and history.
7. **Budgets**: monthly category allocation, actual, remaining and percentage.
8. **Goals**: target, saved amount, progress, contribution history and add contribution.
9. **Reports**: date range, income/expense summary, category and account views.
10. **Household**: members, role management, invite, remove member, settings.
11. **Settings**: currency, locale, timezone, theme, security, export/delete.

## UX rules
- COP formatting default, configurable.
- Do not use float arithmetic for currency; format display only at presentation boundary.
- Clearly label dates, categories, account and transaction type.
- Confirm destructive actions; soft delete by default.
- Include empty/loading/error/success states and retry.
- Form validation errors are inline and accessible.
- Charts have text summaries and accessible labels.
- Support keyboard, visible focus, contrast, semantic heading order and screen readers.
- Avoid relying on color alone for budget/transaction statuses.
- For small-screen use, prevent wide tables; use list cards or horizontal scroll with accessible affordance.
