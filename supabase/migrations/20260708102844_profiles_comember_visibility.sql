-- C5: "Users can read any profile" USING (true) let any signed-in user
-- enumerate every user's name and email across all groups. Replace with
-- self-or-co-member visibility, and remove client access to the email
-- column entirely (nothing in the product needs it client-side; if email
-- reminders arrive later they will be handled server-side).

create or replace function public.shares_group_with(p_user uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = (select auth.uid())
      and b.user_id = p_user
  );
$$;

revoke execute on function public.shares_group_with(uuid) from anon, public;

drop policy "Users can read any profile" on public.profiles;
create policy "Profiles visible to self and group co-members" on public.profiles
  for select using (id = auth.uid() or public.shares_group_with(id));

-- Column-level minimisation: email is no longer readable or writable by
-- client roles (profiles rows are created by the handle_new_user trigger,
-- which only sets id).
revoke all on public.profiles from anon, authenticated;
grant select (id, name, created_at) on public.profiles to authenticated;
grant insert (id, name) on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;
