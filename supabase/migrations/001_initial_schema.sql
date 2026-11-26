-- Migration 001: Initial schema for households and household_members
-- This migration creates the core tables for household management with RLS policies

-- Enable UUID generation
create extension if not exists pgcrypto;

-- Households table
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  base_currency char(3) not null default 'COP',
  locale text not null default 'es-CO',
  timezone text not null default 'America/Bogota',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Household members table
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Indexes for common queries
create index idx_households_created_by on public.households(created_by);
create index idx_household_members_user_id on public.household_members(user_id);
create index idx_household_members_household_id on public.household_members(household_id);

-- Enable RLS
alter table public.households enable row level security;
alter table public.household_members enable row level security;

-- RLS Policies for households

-- Users can only read households they are members of
create policy "Users can read households they are members of"
on public.households for select
using (
  exists (
    select 1 from public.household_members
    where household_members.household_id = households.id
    and household_members.user_id = auth.uid()
  )
);

-- Users can insert households if they are the creator
create policy "Users can insert households as creator"
on public.households for insert
with check (
  created_by = auth.uid()
);

-- Only household owners can update household settings
create policy "Only owners can update households"
on public.households for update
using (
  exists (
    select 1 from public.household_members
    where household_members.household_id = households.id
    and household_members.user_id = auth.uid()
    and household_members.role = 'owner'
  )
);

-- Only household owners can delete households
create policy "Only owners can delete households"
on public.households for delete
using (
  exists (
    select 1 from public.household_members
    where household_members.household_id = households.id
    and household_members.user_id = auth.uid()
    and household_members.role = 'owner'
  )
);

-- RLS Policies for household_members

-- Users can read membership for households they belong to
create policy "Users can read membership for their households"
on public.household_members for select
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
    and hm.user_id = auth.uid()
  )
);

-- Only household owners can insert new members (for invite flow)
create policy "Only owners can insert members"
on public.household_members for insert
with check (
  exists (
    select 1 from public.household_members
    where household_members.household_id = household_members.household_id
    and household_members.user_id = auth.uid()
    and household_members.role = 'owner'
  )
);

-- Users can update member roles if they are the owner (prevents privilege escalation)
create policy "Only owners can update member roles"
on public.household_members for update
using (
  exists (
    select 1 from public.household_members
    where household_members.household_id = household_members.household_id
    and household_members.user_id = auth.uid()
    and household_members.role = 'owner'
  )
)
with check (
  -- Prevent owner from demoting themselves
  not (
    user_id = auth.uid() and role != 'owner'
  )
);

-- Only owners can remove members (with self-removal prevention via application logic)
create policy "Only owners can remove members"
on public.household_members for delete
using (
  exists (
    select 1 from public.household_members
    where household_members.household_id = household_members.household_id
    and household_members.user_id = auth.uid()
    and household_members.role = 'owner'
  )
);

-- Database function to create household with owner atomically
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
  -- Create household
  insert into public.households (name, base_currency, locale, timezone, created_by)
  values (p_name, p_base_currency, p_locale, p_timezone, auth.uid())
  returning id into v_household_id;

  -- Add creator as owner
  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, auth.uid(), 'owner');

  return v_household_id;
end;
$$;

-- Grant execute on function to authenticated users
grant execute on function public.create_household_with_owner to authenticated;
