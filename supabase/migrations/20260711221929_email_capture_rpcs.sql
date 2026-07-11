-- Optional email capture (post-reveal "save access to your group" ask).
-- profiles.email already exists but has NO column grant to authenticated, so the
-- co-member SELECT policy can never expose one member's email to another. Keep it
-- that way: all email access goes through these SECURITY DEFINER, own-row-only RPCs.

create or replace function public.set_my_email(p_email text)
 returns void
 language plpgsql
 volatile
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_norm text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  -- normalise; empty/null clears the email (opt-out)
  v_norm := nullif(btrim(lower(p_email)), '');
  if v_norm is not null and v_norm !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Invalid email address';
  end if;
  update public.profiles set email = v_norm where id = auth.uid();
end;
$function$;

create or replace function public.get_my_email()
 returns text
 language sql
 stable
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select email from public.profiles where id = auth.uid();
$function$;

revoke all on function public.set_my_email(text) from public, anon;
revoke all on function public.get_my_email() from public, anon;
grant execute on function public.set_my_email(text) to authenticated;
grant execute on function public.get_my_email() to authenticated;
