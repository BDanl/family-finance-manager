# SDD 04 — Security and privacy

## Threat model
Financial records are sensitive. Threats include cross-household leakage, privilege escalation, compromised account/session, unsafe exports, exposed secrets, injection, abusive invitations and accidental deletion.

## Mandatory requirements
1. Enable RLS on every table accessible through Supabase APIs.
2. Policies must authorize using household membership, not client-supplied household IDs alone.
3. Role checks must be centralized and tested. Owners/admins may administer household; members may transact; viewers read-only.
4. Household-bound foreign keys and mutations must ensure referenced accounts, categories, budgets and goals belong to the same household.
5. Never expose service-role keys or secrets to the browser.
6. Edge Functions must verify JWT/session, validate request shape and authorize every action.
7. Validate input both in UI and backend/database; database constraints are final guardrails.
8. Rate limit or abuse-protect invite, authentication and sensitive endpoints where applicable.
9. Avoid storing bank login credentials, full card numbers, national ID numbers or other unnecessary personal information.
10. Exports must be scoped and permission-checked; don't leak via public links by default.
11. Avoid PII/financial values in logs, analytics, error messages and URLs.
12. Use HTTPS; use secure auth configuration; keep dependencies patched.
13. Provide member removal and account deletion/privacy workflow, with clear retention and owner-transfer rules.
14. Use separate Supabase development and production projects.
15. Add security tests covering cross-household access, viewer writes, member role escalation, invalid FK cross-tenant references and exports.

## RLS policy design (conceptual)
- SELECT: current user is member of row household; viewer and other roles can read according to scope.
- INSERT: current user is a valid member with transaction permission; `created_by` must equal auth.uid(); household membership must exist.
- UPDATE: current user is member with write permission; preserve tenant ownership; role-specific restrictions.
- DELETE: preferably soft-delete records; require write permission; maintain audit trail.

Policies must be implemented and tested against real Supabase auth contexts. Never treat the conceptual examples as a substitute for policy SQL.

## Sensitive operations
- Invite acceptance, ownership transfer, member removal, export and atomic transfers should use carefully reviewed database RPC or Edge Functions as appropriate.
- Do not place privileged credentials in client code.
- For audit logs, record metadata only, not full payloads or secrets.

## Data handling
- Don't use real family financial data in development or test fixtures.
- Do not share screenshots or logs containing sensitive details.
- Use fake data in demo mode.
- Review privacy and data retention before launch.
