# SDD 03 — Data model and migration baseline

## Entities
- `households`: tenant and preferences.
- `household_members`: user-to-household membership and role.
- `accounts`: household-owned financial accounts.
- `categories`: household categories (income/expense).
- `transactions`: income/expense records.
- `transfers`: paired account movement (separate from income/expense).
- `budgets`: category budget per period.
- `goals`: savings targets.
- `goal_contributions`: contribution ledger.
- `recurring_templates`: repeatable transaction template (no automatic execution in MVP).
- `audit_events`: actor, entity type, entity ID, operation and timestamp, with minimal metadata.

## Suggested fields and constraints
- IDs: UUID.
- Monetary amounts: `numeric(19,4)`; display rounding determined by currency settings.
- Dates: transaction date as `date`; created/updated as `timestamptz`.
- FK relationships and check constraints enforce valid records.
- Household-scoped rows contain `household_id`.
- Membership role: `owner`, `admin`, `member`, `viewer`.
- Transaction type: `income`, `expense`.
- Account type: `cash`, `checking`, `savings`, `credit`, `other`.
- Category type: `income`, `expense`.
- Budget period MVP: month (stored using year/month or month-start date).

## Migration starter (illustrative; Devin should refine and test)

```sql
create extension if not exists pgcrypto;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  base_currency char(3) not null default 'COP',
  locale text not null default 'es-CO',
  timezone text not null default 'America/Bogota',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  account_type text not null check (account_type in ('cash','checking','savings','credit','other')),
  opening_balance numeric(19,4) not null default 0,
  currency char(3) not null default 'COP',
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  category_type text not null check (category_type in ('income','expense')),
  icon text,
  color text,
  is_default boolean not null default false,
  archived_at timestamptz,
  unique (household_id, name, category_type)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.accounts(id),
  category_id uuid references public.categories(id),
  created_by uuid not null references auth.users(id),
  transaction_type text not null check (transaction_type in ('income','expense')),
  amount numeric(19,4) not null check (amount > 0),
  currency char(3) not null default 'COP',
  transaction_date date not null default current_date,
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  month_start date not null,
  amount numeric(19,4) not null check (amount > 0),
  currency char(3) not null default 'COP',
  created_at timestamptz not null default now(),
  unique (household_id, category_id, month_start)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  target_amount numeric(19,4) not null check (target_amount > 0),
  currency char(3) not null default 'COP',
  target_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  amount numeric(19,4) not null check (amount > 0),
  contribution_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
```

## Important implementation caveats
This is an initial illustrative schema, NOT production-ready. Devin must:
- Implement RLS for each table and test unauthorized access.
- Ensure account/category/goal foreign keys cannot reference records belonging to another household (use composite constraints or authorization checks).
- Implement safe owner bootstrap and member invite flow.
- Add transfers, recurring templates and audit events only after detailed constraints and migration review.
- Ensure atomic transfer handling and prevent duplicate or mismatched transfer records.
- Add indexes for common queries (household, transaction date, account, category, month).
- Validate membership/role changes against privilege escalation.
- Consider preventing deletion of members/households with audit-preserving policy.
- Avoid relying on cascade deletion for sensitive financial records without approved retention behavior.
