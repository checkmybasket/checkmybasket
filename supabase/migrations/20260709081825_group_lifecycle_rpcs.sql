-- C1/I1/I9 wiring support: the RLS model (groups SELECT is members-only)
-- means three flows cannot be plain table access from the client:
--   * creating a group (invite code must be generated server-side — I9 —
--     and the organiser membership row must be created atomically),
--   * previewing a group by invite code before joining,
--   * joining a group by invite code (joiner can't SELECT groups to
--     resolve the code to an id).
-- All three become SECURITY DEFINER RPCs with pinned search_path.

-- ─── create_group ─────────────────────────────────────────────────────────────
-- Generates a unique 8-char invite code (31-char alphabet, no 0/O/1/l/i),
-- inserts the group and the organiser's membership in one transaction.
create or replace function public.create_group(
  p_name           text,
  p_mode           group_mode,
  p_budget_amount  integer default null,   -- pence
  p_exchange_date  date    default null,
  p_location       text    default null,
  p_organiser_name text    default null
)
returns json
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_uid      uuid := auth.uid();
  v_code     text;
  v_group_id uuid;
  v_alphabet constant text := '23456789abcdefghjkmnpqrstuvwxyz';
begin
  if v_uid is null then
    raise exception 'Sign-in required';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Group name is required';
  end if;
  if p_organiser_name is null or trim(p_organiser_name) = '' then
    raise exception 'Your name is required';
  end if;

  loop
    select string_agg(substr(v_alphabet, 1 + floor(random() * 31)::int, 1), '')
      into v_code from generate_series(1, 8);
    begin
      insert into groups (name, mode, budget_amount, exchange_date, exchange_location, invite_code, organiser_id)
      values (trim(p_name), p_mode, p_budget_amount, p_exchange_date, nullif(trim(p_location), ''), v_code, v_uid)
      returning id into v_group_id;
      exit;
    exception when unique_violation then
      -- invite_code collision (~1 in 31^8); retry with a fresh code
    end;
  end loop;

  insert into group_members (group_id, user_id, role, name)
  values (v_group_id, v_uid, 'organiser', trim(p_organiser_name));

  update profiles set name = trim(p_organiser_name) where id = v_uid and name is null;

  return json_build_object('group_id', v_group_id, 'invite_code', v_code);
end;
$$;

revoke execute on function public.create_group(text, group_mode, integer, date, text, text) from public, anon;
grant  execute on function public.create_group(text, group_mode, integer, date, text, text) to authenticated;

-- ─── get_group_preview ────────────────────────────────────────────────────────
-- The join page shows group details before the visitor has any session, so
-- this is the one function the anon role may call. Returns only what the
-- join page displays — never member names or emails.
create or replace function public.get_group_preview(p_invite_code text)
returns json
language sql stable security definer
set search_path = public, pg_temp
as $$
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
  from groups g
  where g.invite_code = p_invite_code;
$$;

revoke execute on function public.get_group_preview(text) from public;
grant  execute on function public.get_group_preview(text) to anon, authenticated;

-- ─── join_group ───────────────────────────────────────────────────────────────
-- Resolves the invite code and inserts the caller's membership. Re-joining
-- (same user, same group) just refreshes the profile fields.
create or replace function public.join_group(
  p_invite_code text,
  p_name        text,
  p_likes       text default null,
  p_dislikes    text default null,
  p_sizes       text default null
)
returns json
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_uid      uuid := auth.uid();
  v_group_id uuid;
  v_status   draw_status;
begin
  if v_uid is null then
    raise exception 'Sign-in required';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Your name is required';
  end if;

  select id, draw_status into v_group_id, v_status
  from groups where invite_code = p_invite_code;

  if v_group_id is null then
    raise exception 'Invite link not recognised';
  end if;
  if v_status <> 'pending' and not exists (
    select 1 from group_members where group_id = v_group_id and user_id = v_uid
  ) then
    raise exception 'Names have already been drawn for this group';
  end if;

  insert into group_members (group_id, user_id, name, likes, dislikes, sizes)
  values (v_group_id, v_uid, trim(p_name), nullif(trim(p_likes), ''), nullif(trim(p_dislikes), ''), nullif(trim(p_sizes), ''))
  on conflict (group_id, user_id) do update
    set name     = excluded.name,
        likes    = coalesce(excluded.likes, group_members.likes),
        dislikes = coalesce(excluded.dislikes, group_members.dislikes),
        sizes    = coalesce(excluded.sizes, group_members.sizes);

  update profiles set name = trim(p_name) where id = v_uid and name is null;

  return json_build_object('group_id', v_group_id);
end;
$$;

revoke execute on function public.join_group(text, text, text, text, text) from public, anon;
grant  execute on function public.join_group(text, text, text, text, text) to authenticated;
