-- Per-identity budgets are separate from signup/network abuse controls.
create schema if not exists creation_security;
revoke all on schema creation_security from public, anon, authenticated, service_role;
create table creation_security.allowances (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('group','wishlist')),
 created_times timestamptz[] not null default '{}',
 touched_at timestamptz not null default clock_timestamp(),
 primary key(user_id,action)
);
alter table creation_security.allowances enable row level security;
revoke all on creation_security.allowances from public, anon, authenticated, service_role;
create index creation_allowance_cleanup on creation_security.allowances(touched_at);
create function creation_security.claim(p_action text) returns void
language plpgsql security definer set search_path='' as $$
declare v_uid uuid := auth.uid(); v_now timestamptz; v_times timestamptz[]; v_hours integer; v_retry timestamptz;
begin
 if v_uid is null then raise exception 'Please start a session.' using errcode='42501'; end if;
 if p_action not in ('group','wishlist') or p_action is null then raise exception 'Invalid creation action'; end if;
 insert into creation_security.allowances(user_id,action) values(v_uid,p_action) on conflict do nothing;
 select created_times into v_times from creation_security.allowances where user_id=v_uid and action=p_action for update;
 v_now := clock_timestamp();
 select coalesce(array_agg(t order by t),'{}') into v_times from unnest(v_times) t where t>v_now-interval '24 hours';
 select count(*) into v_hours from unnest(v_times) t where t>v_now-interval '1 hour';
 if cardinality(v_times)>=25 then
   v_retry:=v_times[1]+interval '24 hours';
 elsif v_hours>=10 then
   select min(t)+interval '1 hour' into v_retry from unnest(v_times) t where t>v_now-interval '1 hour';
 end if;
 if v_retry is not null then
   raise exception 'You have reached the creation limit. Please try again in % minute(s).', greatest(1,ceil(extract(epoch from(v_retry-v_now))/60)::int)
    using errcode='P0001';
 end if;
 update creation_security.allowances set created_times=array_append(v_times,v_now),touched_at=v_now where user_id=v_uid and action=p_action;
end; $$;
revoke all on function creation_security.claim(text) from public, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.create_group(p_name text, p_mode group_mode, p_budget_amount integer DEFAULT NULL::integer, p_exchange_date date DEFAULT NULL::date, p_location text DEFAULT NULL::text, p_organiser_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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

  perform creation_security.claim('group');
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
$function$
;

CREATE OR REPLACE FUNCTION public.save_personal_wishlist(p_data jsonb, p_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id uuid; v_owner uuid := auth.uid();
begin
 if v_owner is null then raise exception 'Please start a session.'; end if;
 if p_id is null then
   perform creation_security.claim('wishlist');
   if (select count(*) from personal_wishlist.lists where owner_id=v_owner) >= 30 then raise exception 'You can have up to 30 wishlists.'; end if;
   insert into personal_wishlist.lists(owner_id,title,display_name,occasion,event_date,description)
   values(v_owner,btrim(p_data->>'title'),btrim(p_data->>'display_name'),coalesce(p_data->>'occasion',''),nullif(p_data->>'event_date','')::date,coalesce(p_data->>'description','')) returning id into v_id;
 else
   update personal_wishlist.lists set title=btrim(p_data->>'title'),display_name=btrim(p_data->>'display_name'),
   occasion=coalesce(p_data->>'occasion',''),event_date=nullif(p_data->>'event_date','')::date,description=coalesce(p_data->>'description','')
   where id=p_id and owner_id=v_owner returning id into v_id;
   if v_id is null then raise exception 'Wishlist not available.'; end if;
 end if;
 return v_id;
end; $function$
;
select cron.schedule('cmb-creation-allowance-retention', '17 * * * *',
 $$delete from creation_security.allowances where touched_at < now()-interval '48 hours'$$);
