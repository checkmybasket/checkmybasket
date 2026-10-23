-- "Surprise me" wishlist option: member flags they're open to gift suggestions
-- instead of (or alongside) listing specific products.
-- TEMPORARY fallback pending the AI recommendation engine (blocked backlog item):
-- the flag only routes givers to the generic budget-filtered /gifts pages.

alter table public.group_members
  add column surprise_me boolean not null default false;

-- group_members uses column-level UPDATE grants (see
-- 20260711100522_group_members_prevent_role_escalation.sql) — the new column
-- must be granted explicitly or members can't toggle it.
grant update (surprise_me) on public.group_members to authenticated;
