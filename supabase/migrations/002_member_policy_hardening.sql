-- Migration 002: Harden household_members RLS policies
--
-- Fixes a self-referential subquery bug in the INSERT/UPDATE/DELETE policies:
-- the inner `household_members` range table shadowed the policy target, making
-- `household_members.household_id = household_members.household_id` a tautology.
-- The effective check degenerated to "caller is owner of SOME household", which
-- allowed cross-household member writes. Inner queries are now aliased (`hm`)
-- so `household_members.*` unambiguously refers to the row under policy.
--
-- Additional hardening:
-- * New members cannot be granted the 'owner' role via INSERT or UPDATE
--   (ownership transfer is out of scope; prevents privilege proliferation).
-- * Members cannot delete their own membership row, preventing owners from
--   orphaning a household (no remaining owner).
-- * UPDATE additionally requires the caller to be owner of the row's
--   household_id, so membership cannot be moved to a household the caller
--   does not own.

drop policy if exists "Only owners can insert members" on public.household_members;
create policy "Only owners can insert members"
on public.household_members for insert
with check (
  household_members.role != 'owner'
  and exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
    and hm.user_id = auth.uid()
    and hm.role = 'owner'
  )
);

drop policy if exists "Only owners can update member roles" on public.household_members;
create policy "Only owners can update member roles"
on public.household_members for update
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
    and hm.user_id = auth.uid()
    and hm.role = 'owner'
  )
)
with check (
  -- Ownership cannot be granted or changed through member updates
  household_members.role != 'owner'
  -- The caller must remain owner of the household the row belongs to
  and exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
    and hm.user_id = auth.uid()
    and hm.role = 'owner'
  )
  -- Prevent owner from demoting themselves
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
  and exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
    and hm.user_id = auth.uid()
    and hm.role = 'owner'
  )
);
