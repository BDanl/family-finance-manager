---
name: financial-domain
description: Apply household finance domain rules when implementing transaction, budget, account, goal or reporting features.
---

# Financial domain rules
- Use fixed-precision database numeric values and decimal-safe calculations; never use binary floating point for money calculations.
- Transactions are positive amounts with an explicit type; income/expense semantics must be consistent.
- Transfers must not be counted as income or expense. Use atomic, balanced transfer logic.
- Reconcile account balance semantics and document the formula; test account types and opening balances.
- Budgets compare categorized expense totals to a period budget, with month boundaries using household timezone.
- Goals use contribution ledgers; don't edit aggregate progress in a way that loses contribution history.
- Recurring entries are templates in MVP; user confirms creation before transactions are generated.
- Never silently convert currency. Store currency and use an explicitly documented FX source and policy if conversions are added.
- Reports must respect household permissions and filter context.
- Do not present the app as providing financial, investment, tax, lending or legal advice.
