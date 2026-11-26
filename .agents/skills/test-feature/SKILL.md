---
name: test-feature
description: Create and run tests for a feature, especially financial calculations, permissions and tenant isolation.
---

# Feature testing
- Read acceptance criteria, implementation and SDDs.
- Cover normal, boundary, invalid, empty and error cases.
- For financial math, use decimal-safe values and test rounding, negative/zero invalid amounts, date boundaries, transfers, budget totals and currency behavior.
- For permissions, use distinct users/households/roles. Test read and write isolation, role changes and forged ownership.
- Add integration tests for database/RLS where environment allows; clearly state if tests use mocks instead.
- Ensure tests do not contain real financial or personal data.
- Run relevant test suite, lint, type check and build.
- Report test evidence, coverage gaps and environment limitations.
