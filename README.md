# Family Finance Manager — Devin starter pack

Starter specifications and agent skills for building a family finance management web app.

## Recommended stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui (optional, use accessible components)
- Supabase: PostgreSQL, Auth, Storage, Edge Functions
- Vercel: hosting and optional serverless functions
- GitHub: version control and deployment source

## Documents
- `docs/01-product-sdd.md`: Product requirements and MVP scope
- `docs/02-architecture-sdd.md`: architecture and stack
- `docs/03-data-model-sdd.md`: database model and initial SQL
- `docs/04-security-sdd.md`: security requirements
- `docs/05-ui-ux-sdd.md`: screens, UX and accessibility
- `docs/06-api-sdd.md`: API/data access and server-side functions
- `docs/07-roadmap-and-acceptance.md`: milestones and acceptance criteria
- `AGENTS.md`: always-on project rules for Devin
- `.agents/skills/*/SKILL.md`: reusable Devin skills

## Start with Devin
1. Create a GitHub repository and clone it.
2. Copy this pack into the repository root.
3. Commit the specifications before code: `git add . && git commit -m "Add project specifications and agent skills"`
4. Ask Devin: **"Read AGENTS.md and all SDD documents. Do not code yet. Produce a plan, identify unresolved decisions, and propose an MVP implementation sequence. Respect the project skills."**
5. Once the plan is approved, ask Devin to implement milestone 1. Use the skill `@skills:implement-milestone`.
6. Connect Supabase and Vercel only after reviewing secrets and deployment settings.

## Initial product assumptions
- Household/family spaces with multiple members and roles.
- Colombian Spanish and COP default display; currency and locale configurable.
- Manual transaction entry first; no bank integrations in MVP.
- The app tracks and organizes finances; it does not provide investment, credit or tax advice.
- Avoid storing card numbers, bank credentials, government identifiers or unnecessary sensitive data.
