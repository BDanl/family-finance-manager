---
name: database-and-rls
description: Design or modify Supabase schema, migrations, constraints, indexes, and household-isolating RLS policies.
---

# Database and RLS procedure
- Read data-model and security SDDs first.
- Create versioned SQL migrations; never edit deployed migration history without a documented recovery plan.
- Use constraints, FK relations, composite tenant-aware constraints and indexes.
- Enable RLS on every exposed table.
- Define policies for SELECT, INSERT, UPDATE and DELETE (or soft delete), considering roles and household membership.
- Do not authorize based on user-provided household ID alone.
- Verify referenced accounts/categories/goals belong to the same household.
- Protect role/owner changes against escalation; owner cannot be accidentally removed or demoted without a safe transfer.
- Test with multiple distinct users and households, including viewers and unauthenticated sessions.
- Include negative tests: cross-tenant read/write, viewer mutation, forged created_by, invalid cross-household FK, privilege escalation.
- Check query plans and indexes for common date-filtered dashboard/transaction queries.
- Provide SQL migration, tests, policy explanation and rollback/recovery cautions.
