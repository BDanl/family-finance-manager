---
name: security-review
description: Review the family-finance codebase or a change for privacy, security, tenant isolation, secrets and financial data risks.
---

# Security review
1. Review the diff and relevant security/data model SDDs.
2. Check for secrets, service-role keys, unsafe environment variables, credentials in logs or URLs.
3. Verify RLS on every API-exposed table and evaluate each policy.
4. Test household isolation and role permissions; don't assume UI hiding is security.
5. Verify cross-tenant FK integrity, validation, atomic workflows and idempotency.
6. Check input handling, injection/XSS, export formula injection and unsafe uploads.
7. Review invitation/session/account deletion and ownership-transfer flows.
8. Ensure logs and analytics avoid personal/financial data.
9. Check dependency/configuration risks, HTTPS and environment separation.
10. Categorize findings Critical/High/Medium/Low; provide evidence, impact and remediation. Do not modify code until asked to remediate.
