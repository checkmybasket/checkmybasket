-- Back up existing raw preview records and function/policy definitions before applying.
create schema if not exists request_security;
revoke all on schema request_security from public, anon, authenticated, service_role;
create table request_security.preview_key (
 singleton boolean primary key default true check (singleton),
 secret bytea not null
);
alter table request_security.preview_key enable row level security;
revoke all on request_security.preview_key from public, anon, authenticated, service_role;
insert into request_security.preview_key values (true, extensions.gen_random_bytes(32));
-- Legacy raw keys cannot remain or be reused; protected backup is outside the API.
delete from public.rl_group_preview;
alter table public.rl_group_preview rename column ip to request_key;
alter table public.rl_group_preview add constraint preview_key_shape check (request_key ~ '^[0-9a-f]{64}$');
create index preview_window_cleanup on public.rl_group_preview(window_start);
revoke all on public.rl_group_preview from public, anon, authenticated, service_role;

create or replace function public.leave_group(p_group_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Same parent lock as join/finalisation; caller never supplies another user ID.
 select organiser_id into v_owner from public.groups where id=p_group_id for update;
 if not found then return; end if;
 if v_owner=v_uid then raise exception 'Organisers must delete their group instead' using errcode='42501'; end if;
 if not exists(select 1 from public.group_members where group_id=p_group_id and user_id=v_uid) then return; end if;
 delete from public.wishlist_items where group_id=p_group_id and user_id=v_uid;
 delete from public.group_members where group_id=p_group_id and user_id=v_uid;
end; $$;
revoke all on function public.leave_group(uuid) from public, anon, service_role;
grant execute on function public.leave_group(uuid) to authenticated;
-- Require the atomic path, including for legacy clients. No other user's rows can be deleted.
revoke delete on public.group_members from anon, authenticated;

create or replace function public.get_group_preview(p_invite_code text)
 returns json
 language plpgsql
 volatile
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_ip     text;
  v_key    text;
  v_secret bytea;
  v_count  integer;
  v_result json;
  v_limit  constant integer  := 60;
  v_window constant interval := interval '10 minutes';
begin
  -- First hop of x-forwarded-for is the client IP; may be absent (fail-open).
  v_ip := nullif(btrim(split_part(
            coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''),
            ',', 1)), '');

  if v_ip is not null then
    select secret into strict v_secret from request_security.preview_key where singleton;
    v_key := encode(extensions.hmac(convert_to((now() at time zone 'UTC')::date::text || ':' || v_ip, 'UTF8'), v_secret, 'sha256'), 'hex');
    delete from public.rl_group_preview where window_start < now() - interval '1 hour';
    insert into public.rl_group_preview as r (request_key, window_start, count)
    values (v_key, now(), 1)
    on conflict (request_key) do update
      set count        = case when r.window_start < now() - v_window then 1
                              else r.count + 1 end,
          window_start = case when r.window_start < now() - v_window then now()
                              else r.window_start end
    returning r.count into v_count;

    if v_count > v_limit then
      raise exception 'rate limit exceeded'
        using errcode = 'check_violation',
              hint = 'Too many preview requests; please wait a few minutes.';
    end if;
  end if;

  select json_build_object(
    'group_id',       g.id,
    'name',           g.name,
    'mode',           g.mode,
    'budget_amount',  g.budget_amount,
    'exchange_date',  g.exchange_date,
    'draw_status',    g.draw_status,
    'member_count',   (select count(*) from group_members m where m.group_id = g.id),
    'organiser_name', (select m.name from group_members m
                       where m.group_id = g.id and m.role = 'organiser' limit 1)
  )
  into v_result
  from groups g
  where g.invite_code = p_invite_code;

  return v_result;
end;
$function$;

revoke all on function public.get_group_preview(text) from public;
grant execute on function public.get_group_preview(text) to anon, authenticated;
-- Installed pg_cron; one purpose-specific job. Request-time cleanup also runs.
select cron.schedule('cmb-preview-retention', '7 * * * *',
 $$delete from public.rl_group_preview where window_start < now() - interval '1 hour'$$);
