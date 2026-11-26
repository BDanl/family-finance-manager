---
name: implement-milestone
description: Implement an approved milestone from the family finance manager SDD, with tests and security review.
---

# Implement an approved milestone
1. Read `AGENTS.md`, all SDDs, and existing code.
2. Identify the milestone and acceptance criteria. If no milestone is specified, ask before implementing.
3. Write a concise implementation plan with files, migration impact, security risks and test plan.
4. Implement only the approved scope; do not silently add unrelated features.
5. Use existing conventions, strict TypeScript, small components and typed service modules.
6. Create migration files for schema changes; never make undocumented dashboard-only changes.
7. Implement RLS and tests whenever tables or access behavior are introduced or changed.
8. Validate data and authorization on the server/database, not only in the UI.
9. Run lint, type checks, tests and build.
10. Review diff for secrets, cross-household access, unintended destructive operations and scope creep.
11. Report files changed, test evidence, migration/deployment steps, known issues and next milestone.
