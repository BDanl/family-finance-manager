-- Migration 003: Accounts, categories, centralized role helper, policy recursion fix
--
-- 1. Fixes latent infinite-recursion bug: household_members policies (001/002)
--    ran `exists` subqueries against household_members itself. PostgreSQL applies
--    RLS to tables inside policy expressions, so those policies would fail at
--    runtime. A security-definer helper centralizes role checks (per security
--    SDD: "role checks must be centralized") and bypasses RLS safely.
--
-- 2. Creates `accounts` and `categories` tables per data-model SDD.
--
-- 3. Extends create_household_with_owner to seed default categories atomically,
--    and backfills seeds for households created before this migration.
--
-- Balance convention (documented for M3+):
--   account balance = opening_balance + SUM(income) - SUM(expense) + net transfers
--   Until transactions exist, balance == opening_balance.
--   Monetary values use numeric(19,4); never floating point.

-- ---------------------------------------------------------------------------
-- Centralized household role helper (bypasses RLS as security definer)
-- ---------------------------------------------------------------------------
create or replace function public.current_household_role(p_household_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select hm.role
  from public.household_members hm
  where hm.household_id = p_household_id
    and hm.user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_household_role(uuid) from public;
-- anon included so unauthenticated queries get a clean deny (null role)
-- instead of a function permission error. The function only reveals the
-- caller's own role, so this leaks nothing.
grant execute on function public.current_household_role(uuid) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Re-create households policies using the centralized helper
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read households they are members of" on public.households;
create policy "Users can read households they are members of"
on public.households for select
using (public.current_household_role(id) is not null);

drop policy if exists "Only owners can update households" on public.households;
create policy "Only owners can update households"
on public.households for update
using (public.current_household_role(id) = 'owner')
with check (public.current_household_role(id) = 'owner');

drop policy if exists "Only owners can delete households" on public.households;
create policy "Only owners can delete households"
on public.households for delete
using (public.current_household_role(id) = 'owner');

-- households INSERT policy ("Users can insert households as creator") unchanged:
-- it does not subquery household_members, so it has no recursion issue.

-- ---------------------------------------------------------------------------
-- Re-create household_members policies using the centralized helper
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read membership for their households" on public.household_members;
create policy "Users can read membership for their households"
on public.household_members for select
using (public.current_household_role(household_members.household_id) is not null);

drop policy if exists "Only owners can insert members" on public.household_members;
create policy "Only owners can insert members"
on public.household_members for insert
with check (
  household_members.role != 'owner'
  and public.current_household_role(household_members.household_id) = 'owner'
);

drop policy if exists "Only owners can update member roles" on public.household_members;
create policy "Only owners can update member roles"
on public.household_members for update
using (public.current_household_role(household_members.household_id) = 'owner')
with check (
  household_members.role != 'owner'
  and public.current_household_role(household_members.household_id) = 'owner'
  and not (
    household_members.user_id = auth.uid()
    and household_members.role != 'owner'
  )
);

drop policy if exists "Only owners can remove members" on public.household_members;
create policy "Only owners can remove members"
on public.household_members for delete
using (
  household_members.user_id != auth.uid()
  and public.current_household_role(household_members.household_id) = 'owner'
);

-- ---------------------------------------------------------------------------
-- Accounts table
-- ---------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  account_type text not null check (account_type in ('cash','checking','savings','credit','other')),
  description text,
  icon text,
  color text,
  currency char(3) not null default 'COP',
  opening_balance numeric(19,4) not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- enables composite tenant-aware FKs from transactions in M3
  unique (household_id, id)
);

create index idx_accounts_household_id on public.accounts(household_id);
create index idx_accounts_household_archived on public.accounts(household_id, archived_at);

alter table public.accounts enable row level security;

-- All household members can read accounts (including viewers)
create policy "Members can read accounts"
on public.accounts for select
using (public.current_household_role(accounts.household_id) is not null);

-- Only owners/admins can create accounts
create policy "Owners and admins can create accounts"
on public.accounts for insert
with check (public.current_household_role(accounts.household_id) in ('owner','admin'));

-- Only owners/admins can update accounts; cannot move rows across households
create policy "Owners and admins can update accounts"
on public.accounts for update
using (public.current_household_role(accounts.household_id) in ('owner','admin'))
with check (public.current_household_role(accounts.household_id) in ('owner','admin'));

-- No DELETE policy: accounts are archived via archived_at, never hard-deleted
-- through the API (preserves historical financial records).

-- ---------------------------------------------------------------------------
-- Categories table
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  category_type text not null check (category_type in ('income','expense')),
  icon text,
  color text,
  is_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (household_id, id)
  -- name uniqueness is enforced by idx_categories_unique_name below
  -- (case-insensitive, active rows only)
);

create index idx_categories_household_id on public.categories(household_id);
create index idx_categories_household_type on public.categories(household_id, category_type);

-- Case-insensitive unique category name per household/type among active rows.
-- Archived categories don't block reusing a name. ON CONFLICT DO NOTHING in
-- seed_default_categories still works (unique indexes count as conflicts).
create unique index idx_categories_unique_name
on public.categories (household_id, category_type, lower(name))
where archived_at is null;

alter table public.categories enable row level security;

-- All household members can read categories (including viewers)
create policy "Members can read categories"
on public.categories for select
using (public.current_household_role(categories.household_id) is not null);

-- Only owners/admins can create categories
create policy "Owners and admins can create categories"
on public.categories for insert
with check (public.current_household_role(categories.household_id) in ('owner','admin'));

-- Only owners/admins can update/archive categories; cannot move across households
create policy "Owners and admins can update categories"
on public.categories for update
using (public.current_household_role(categories.household_id) in ('owner','admin'))
with check (public.current_household_role(categories.household_id) in ('owner','admin'));

-- No DELETE policy: categories are archived via archived_at so historical
-- transactions keep referencing valid category rows.

-- ---------------------------------------------------------------------------
-- Default category seeds
-- ---------------------------------------------------------------------------
create or replace function public.seed_default_categories(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (household_id, name, category_type, is_default)
  values
    (p_household_id, 'Vivienda', 'expense', true),
    (p_household_id, 'Servicios', 'expense', true),
    (p_household_id, 'Mercado', 'expense', true),
    (p_household_id, 'Transporte', 'expense', true),
    (p_household_id, 'Salud', 'expense', true),
    (p_household_id, 'Educación', 'expense', true),
    (p_household_id, 'Ocio', 'expense', true),
    (p_household_id, 'Restaurantes', 'expense', true),
    (p_household_id, 'Compras', 'expense', true),
    (p_household_id, 'Otros', 'expense', true),
    (p_household_id, 'Salario', 'income', true),
    (p_household_id, 'Freelance', 'income', true),
    (p_household_id, 'Inversiones', 'income', true),
    (p_household_id, 'Regalos', 'income', true),
    (p_household_id, 'Otros', 'income', true)
  on conflict do nothing;
end;
$$;

-- Internal-only helper: must NOT be callable by authenticated users, otherwise
-- anyone could seed categories into arbitrary households (security definer
-- bypasses RLS). create_household_with_owner invokes it as the definer owner.
revoke all on function public.seed_default_categories(uuid) from public, anon, authenticated;

-- Backfill seeds for households created before this migration
select public.seed_default_categories(id) from public.households;

-- Extend household creation to seed categories atomically
create or replace function public.create_household_with_owner(
  p_name text,
  p_base_currency char(3 default 'COP'),
  p_locale text default 'es-CO',
  p_timezone text default 'America/Bogota'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_household_id uuid;
begin
  insert into public.households (name, base_currency, locale, timezone, created_by)
  values (p_name, p_base_currency, p_locale, p_timezone, auth.uid())
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, auth.uid(), 'owner');

  perform public.seed_default_categories(v_household_id);

  return v_household_id;
end;
$$;

grant execute on function public.create_household_with_owner to authenticated;
