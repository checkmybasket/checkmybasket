CREATE OR REPLACE FUNCTION public.execute_draw(p_group_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_status     public.draw_status;
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
  select g.draw_status into v_status from public.groups g
    where g.id=p_group_id and g.organiser_id=auth.uid() for update;
  if not found then raise exception 'Only the organiser can draw names'; end if;
  if v_status <> 'pending' then return; end if;
  if exists(select 1 from public.draws where group_id=p_group_id) then
    raise exception 'Existing matches cannot be replaced';
  end if;

  -- Get joined member IDs
  select array_agg(user_id order by random())
  into v_members
  from group_members
  where group_id = p_group_id;

  if coalesce(array_length(v_members, 1), 0) < 3 then
    raise exception 'Need at least 3 members to draw';
  end if;

  -- Get exclusion pairs
  select array_agg(user_a_id), array_agg(user_b_id)
  into v_excl_a, v_excl_b
  from exclusions
  where group_id = p_group_id;

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

  -- Insert the new draws
  for i in 1..array_length(v_members, 1) loop
    insert into draws (group_id, giver_id, recipient_id)
    values (p_group_id, v_members[i], v_shuffled[i]);
  end loop;

  -- Mark group as drawn
  update groups set draw_status = 'drawn' where id = p_group_id;
end;
$function$;

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

-- The browser may edit details, never lifecycle state or ownership/identifiers.
revoke update on public.groups from anon,authenticated;
grant update(name,mode,budget_amount,budget_currency,exchange_date,exchange_location)
  on public.groups to authenticated;

