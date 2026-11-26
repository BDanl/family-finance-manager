---
name: deploy-preview
description: Prepare and validate a safe Vercel preview or production deployment using GitHub and Supabase.
---

# Deployment procedure
- Read architecture and security SDDs; determine target environment.
- Confirm the target branch, environment and deployment scope.
- Never print, commit or expose secrets. Check environment variables by names only.
- Verify Supabase environment/project matches deployment (development, preview or production).
- Confirm required migrations are reviewed and applied in order; never reset production or delete data.
- Verify RLS and smoke-test sign-in, household, transaction creation, dashboard and permission boundaries.
- For production, require explicit user confirmation before performing destructive or irreversible steps.
- Review build output and deployment diff.
- Provide URL only if verified by the deployment result; otherwise clearly state that it was not verified.
