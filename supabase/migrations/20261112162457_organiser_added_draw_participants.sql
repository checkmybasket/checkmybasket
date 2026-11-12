-- A participant can take part in a draw before having a Supabase identity.
alter table public.group_members alter column user_id drop not null;
alter table public.groups add column organiser_can_view_matches boolean not null default false;
grant select (organiser_can_view_matches) on public.groups to authenticated;

alter table public.draws
  alter column giver_id drop not null,
  alter column recipient_id drop not null,
  add column giver_member_id uuid references public.group_members(id) on delete set null,
  add column recipient_member_id uuid references public.group_members(id) on delete set null,
  add column giver_name_at_draw text,
  add column recipient_name_at_draw text,
  add constraint draw_distinct_members check (giver_member_id <> recipient_member_id);

create unique index draws_giver_member on public.draws(giver_member_id);
create unique index draws_recipient_member on public.draws(recipient_member_id);
grant select (recipient_member_id) on public.draws to authenticated;

create table request_security.draw_invites (
  member_id uuid primary key references public.group_members(id) on delete cascade,
  token uuid not null unique default gen_random_uuid()
);
alter table request_security.draw_invites enable row level security;
revoke all on request_security.draw_invites from public, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.execute_draw(p_group_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_status     public.draw_status;
  v_managed    boolean;
  v_members    uuid[];
  v_shuffled   uuid[];
  v_excl_a     uuid[];
  v_excl_b     uuid[];
  v_attempts   int := 0;
  v_valid      boolean;
  i            int;
begin
  -- Lock the lifecycle row before checking its status. Concurrent draws wait,
  -- then observe the committed final state rather than replacing assignments.
  select g.draw_status, g.organiser_can_view_matches into v_status, v_managed from public.groups g
    where g.id=p_group_id and g.organiser_id=auth.uid() for update;
  if not found then raise exception 'Only the organiser can draw names'; end if;
  if v_status <> 'pending' then return; end if;
  if exists(select 1 from public.draws where group_id=p_group_id) then
    raise exception 'Existing matches cannot be replaced';
  end if;

  -- Draw by stable participant ID so an invite can be claimed later.
  select array_agg(id order by random())
  into v_members
  from group_members
  where group_id = p_group_id;

  if coalesce(array_length(v_members, 1), 0) < 3 then
    raise exception 'Need at least 3 members to draw';
  end if;

  -- Get exclusion pairs
  select array_agg(a.id), array_agg(b.id)
  into v_excl_a, v_excl_b
  from exclusions e
  join group_members a on a.group_id = e.group_id and a.user_id = e.user_a_id
  join group_members b on b.group_id = e.group_id and b.user_id = e.user_b_id
  where e.group_id = p_group_id;

  -- Attempt derangement up to 1000 times
  loop
    v_attempts := v_attempts + 1;
    if v_attempts > 1000 then
      raise exception 'Could not find valid draw — check exclusion rules';
    end if;

    -- Shuffle
    select array_agg(u order by random())
    into v_shuffled
    from unnest(v_members) u;

    v_valid := true;

    for i in 1..array_length(v_members, 1) loop
      -- No self-draw
      if v_members[i] = v_shuffled[i] then
        v_valid := false;
        exit;
      end if;

      -- Check exclusions
      if v_excl_a is not null then
        declare
          j int;
        begin
          for j in 1..array_length(v_excl_a, 1) loop
            if (v_members[i] = v_excl_a[j] and v_shuffled[i] = v_excl_b[j]) or
               (v_members[i] = v_excl_b[j] and v_shuffled[i] = v_excl_a[j]) then
              v_valid := false;
              exit;
            end if;
          end loop;
        end;
      end if;

      if not v_valid then exit; end if;
    end loop;

    exit when v_valid;
  end loop;

  insert into draws (group_id, giver_id, recipient_id, giver_member_id, recipient_member_id, giver_name_at_draw, recipient_name_at_draw)
  select p_group_id, giver.user_id, recipient.user_id, giver.id, recipient.id,
    case when v_managed then giver.name end, case when v_managed then recipient.name end
  from unnest(v_members, v_shuffled) as pair(giver_id, recipient_id)
  join group_members giver on giver.id = pair.giver_id
  join group_members recipient on recipient.id = pair.recipient_id;

  -- Mark group as drawn
  update groups set draw_status = 'drawn' where id = p_group_id;
end;
$function$;


create function public.add_draw_participant(p_group_id uuid, p_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_status public.draw_status;
  v_member_id uuid;
  v_name text := btrim(p_name);
begin
  select draw_status into v_status from public.groups
    where id = p_group_id and organiser_id = auth.uid() for update;
  if not found then raise exception 'Only the organiser can add participants'; end if;
  if v_status <> 'pending' then raise exception 'The draw is already complete'; end if;
  if coalesce(char_length(v_name), 0) not between 1 and 80 then
    raise exception 'Enter a name between 1 and 80 characters';
  end if;
  if exists (
    select 1 from public.group_members where group_id = p_group_id and lower(name) = lower(v_name)
  ) then
    raise exception 'A participant already has this name. Add a surname or initial';
  end if;

  insert into public.group_members (group_id, name) values (p_group_id, v_name) returning id into v_member_id;
  insert into request_security.draw_invites (member_id) values (v_member_id);
  update public.groups set organiser_can_view_matches = true where id = p_group_id;
end;
$$;

create function public.remove_draw_participant(p_group_id uuid, p_member_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_status public.draw_status;
begin
  select draw_status into v_status from public.groups
    where id = p_group_id and organiser_id = auth.uid() for update;
  if not found then raise exception 'Only the organiser can remove participants'; end if;
  if v_status <> 'pending' then raise exception 'The draw is already complete'; end if;

  delete from public.group_members where group_id = p_group_id and id = p_member_id and user_id is null;
end;
$$;

create function public.get_draw_participant_invite(p_group_id uuid, p_member_id uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select i.token from request_security.draw_invites i
  join public.group_members m on m.id = i.member_id
  join public.groups g on g.id = m.group_id
  where m.group_id = p_group_id and m.id = p_member_id and m.user_id is null
    and g.organiser_id = auth.uid();
$$;

create function public.claim_draw_participant(p_invite_code text, p_token uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_group_id uuid;
  v_member public.group_members%rowtype;
begin
  if v_uid is null then raise exception 'Sign-in required'; end if;

  select id into v_group_id from public.groups where invite_code = p_invite_code for update;
  if not found then raise exception 'This personal invite is unavailable'; end if;

  select m.* into v_member from public.group_members m
    join request_security.draw_invites i on i.member_id = m.id
    where m.group_id = v_group_id and i.token = p_token;
  if not found or (v_member.user_id is not null and v_member.user_id <> v_uid) then
    raise exception 'This personal invite is unavailable';
  end if;
  if v_member.user_id = v_uid then return v_group_id; end if;
  if exists (select 1 from public.group_members where group_id = v_group_id and user_id = v_uid) then
    raise exception 'You already have a place in this draw';
  end if;

  update public.group_members set user_id = v_uid, joined_at = now() where id = v_member.id;
  update public.draws set giver_id = v_uid where giver_member_id = v_member.id;
  update public.draws set recipient_id = v_uid where recipient_member_id = v_member.id;
  update public.profiles set name = v_member.name where id = v_uid and name is null;
  return v_group_id;
end;
$$;

create function public.get_managed_draw_matches(p_group_id uuid)
returns table (draw_id uuid, giver_name text, recipient_name text)
language sql stable security definer set search_path = '' as $$
  select d.id, d.giver_name_at_draw, d.recipient_name_at_draw
  from public.draws d
  join public.groups g on g.id = d.group_id
  where d.group_id = p_group_id and g.organiser_id = auth.uid()
    and g.organiser_can_view_matches and g.draw_status <> 'pending'
  order by d.giver_name_at_draw, d.id;
$$;

revoke all on function public.add_draw_participant(uuid, text),
  public.remove_draw_participant(uuid, uuid), public.get_draw_participant_invite(uuid, uuid),
  public.claim_draw_participant(text, uuid), public.get_managed_draw_matches(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.add_draw_participant(uuid, text),
  public.remove_draw_participant(uuid, uuid), public.get_draw_participant_invite(uuid, uuid),
  public.claim_draw_participant(text, uuid), public.get_managed_draw_matches(uuid)
  to authenticated;

-- A shared invite must not create a second entry for a reserved name.
CREATE OR REPLACE FUNCTION public.join_group(p_invite_code text, p_name text, p_likes text DEFAULT NULL::text, p_dislikes text DEFAULT NULL::text, p_sizes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
  from groups where invite_code = p_invite_code for update;

  if v_group_id is null then
    raise exception 'Invite link not recognised';
  end if;
  if v_status <> 'pending' and not exists (
    select 1 from group_members where group_id = v_group_id and user_id = v_uid
  ) then
    raise exception 'Names have already been drawn for this group';
  end if;

  if exists (
    select 1 from group_members
    where group_id = v_group_id and user_id is null and lower(name) = lower(trim(p_name))
  ) then
    raise exception 'This name already has a reserved place. Use your personal invite link';
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
$function$;
