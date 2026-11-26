# Family Finance Manager — agent rules

## Mission
Build a secure, maintainable household-finance web application according to the SDDs in `docs/`. Treat those documents as the requirements baseline.

## Before coding
- Read all SDDs and relevant skills.
- Summarize the requested milestone, affected files, data migrations, security implications and test plan.
- Do not implement features outside the approved milestone without asking.

## Stack constraints
- Frontend: React, TypeScript, Vite.
- Use Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions) for backend services.
- Use Vercel for hosting.
- Keep data access in typed, isolated service modules. Avoid ad hoc SQL or database calls in UI components.
- Prefer small, accessible, reusable components. Use strict TypeScript; do not use `any` unless justified and documented.
- Use migrations for schema changes. Never rely on dashboard-only schema changes.
- Use environment variables for configuration. Never commit secrets or `.env` files.

## Security and privacy
- Household data is private and tenant-isolated.
- RLS is mandatory for all exposed tables. RLS policies must enforce household membership and role where applicable.
- Never trust household IDs, role claims, amounts, or ownership values supplied by the client without authorization checks.
- Never put Supabase service-role keys, credentials, or private API keys in browser code.
- Sensitive operations must be implemented server-side (Edge Functions) with authorization and validation.
- Avoid logging financial amounts, personal data, tokens, or full transaction payloads.
- Validate all input; use safe query patterns; protect against XSS and injection.
- No external financial institution integration or payment processing unless explicitly approved.

## Quality
- Add tests for business logic and permission-sensitive behavior.
- Run lint, type checks and relevant tests before declaring completion.
- Review migration rollback/forward implications; never reset or delete production data.
- Do not disable security checks to make tests pass.
- Keep docs updated when behavior, schema or architecture changes.
- Report honestly: implemented, tested, not tested, known risks, and files changed.

## Workflow
1. Plan.
2. Implement a narrow milestone.
3. Run checks and tests.
4. Review diff and security impact.
5. Summarize results and propose the next milestone.
