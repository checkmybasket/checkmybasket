-- Security fix: get_group_preview is anon-callable with no rate limit.
-- Invite codes (31^8) make enumeration impractical, but add a lightweight
-- IP-keyed rate limit (~60 calls / IP / 10 min). Fail-open when the
-- x-forwarded-for header is absent so legitimate users are never harmed.

-- Per-IP counter table. RLS enabled with NO policies => all direct client
-- access denied; only the SECURITY DEFINER function (owned by postgres) touches it.
create table if not exists public.rl_group_preview (
  ip           text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);
alter table public.rl_group_preview enable row level security;
revoke all on public.rl_group_preview from anon, authenticated;

create or replace function public.get_group_preview(p_invite_code text)
 returns json
 language plpgsql
 volatile
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_ip     text;
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
    insert into public.rl_group_preview as r (ip, window_start, count)
    values (v_ip, now(), 1)
    on conflict (ip) do update
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
