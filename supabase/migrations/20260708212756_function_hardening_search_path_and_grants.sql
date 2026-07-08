-- I7: pin search_path on SECURITY DEFINER functions (linter 0011).
-- 'public, pg_temp' keeps unqualified references working while preventing
-- temp-schema shadowing; shares_group_with already uses '' with qualified refs.
alter function public.execute_draw(uuid) set search_path = public, pg_temp;
alter function public.daily_message_count(uuid, uuid) set search_path = public, pg_temp;
alter function public.is_group_member(uuid) set search_path = public, pg_temp;
alter function public.is_group_organiser(uuid) set search_path = public, pg_temp;

-- I7: trim the exposed RPC surface (linters 0028/0029).
-- handle_new_user is trigger-only: no API role may call it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- The app always runs with an authenticated (anonymous-auth) session, so the
-- pre-sign-in anon role needs no RPC access at all. authenticated keeps
-- EXECUTE: execute_draw is the organiser's draw RPC; the other three are
-- referenced inside RLS policies, which evaluate with the caller's privileges.
-- (The remaining 0029 WARNs on these five functions are therefore accepted.)
revoke execute on function public.execute_draw(uuid) from public, anon;
revoke execute on function public.daily_message_count(uuid, uuid) from public, anon;
revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_organiser(uuid) from public, anon;
