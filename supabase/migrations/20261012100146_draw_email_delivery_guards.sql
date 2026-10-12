-- Delivery state is service-only, stores no address/name/body, and is removed
-- with its draw. Existing draws are suppressed: past delivery is unknown.
create schema draw_notifications;
revoke all on schema draw_notifications from public, anon, authenticated;
create table draw_notifications.deliveries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null unique references public.draws(id) on delete cascade,
  payload_hash text check (payload_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'pending' check (status in
    ('pending','processing','sent','failed','cancelled','expired','legacy')),
  attempts integer not null default 0 check (attempts between 0 and 3),
  first_attempt_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz,
  sent_at timestamptz
);
alter table draw_notifications.deliveries enable row level security;
revoke all on draw_notifications.deliveries from public, anon, authenticated;
insert into draw_notifications.deliveries(draw_id,status)
select id,'legacy' from public.draws;

create function public.claim_draw_email(p_draw_id uuid,p_payload_hash text,p_email text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  job draw_notifications.deliveries;
  valid_draw boolean;
begin
  if p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid delivery payload hash';
  end if;
  select exists(select 1 from public.draws d
    join public.groups g on g.id=d.group_id
    join public.profiles p on p.id=d.giver_id
    join public.group_members m on m.group_id=d.group_id and m.user_id=d.giver_id
    where d.id=p_draw_id and g.draw_status='drawn'
      and nullif(btrim(p.email),'') is not null
      and p.email=p_email
      and d.drawn_at > clock_timestamp()-interval '23 hours') into valid_draw;
  if not valid_draw then return jsonb_build_object('outcome','ineligible'); end if;
  insert into draw_notifications.deliveries(draw_id,payload_hash)
    values(p_draw_id,p_payload_hash) on conflict(draw_id) do nothing;
  select * into job from draw_notifications.deliveries
    where draw_id=p_draw_id for update;
  if job.status in ('sent','failed','cancelled','expired','legacy') then
    return jsonb_build_object('outcome','suppressed');
  end if;
  if job.status='processing' and job.lease_until>clock_timestamp() then
    return jsonb_build_object('outcome','busy');
  end if;
  -- A changed address, sender or content must never reuse a provider key with
  -- a different body. A deliberate new-notification workflow is out of scope.
  if job.payload_hash<>p_payload_hash then
    update draw_notifications.deliveries set status='cancelled',
      lease_token=null,lease_until=null,next_attempt_at=null where id=job.id;
    return jsonb_build_object('outcome','changed_payload');
  end if;
  if job.attempts>=3 then
    update draw_notifications.deliveries set status='failed',lease_token=null,
      lease_until=null,next_attempt_at=null where id=job.id;
    return jsonb_build_object('outcome','suppressed');
  end if;
  if job.next_attempt_at>clock_timestamp() then
    return jsonb_build_object('outcome','cooldown');
  end if;
  update draw_notifications.deliveries set status='processing',
    attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,clock_timestamp()),
    lease_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '90 seconds',
    next_attempt_at=null where id=job.id returning * into job;
  return jsonb_build_object('outcome','claimed','id',job.id,
    'lease',job.lease_token,'attempt',job.attempts);
end $$;

create function public.finish_draw_email(p_id uuid,p_lease uuid,p_result text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare affected integer;
begin
  if p_result not in ('sent','retry','failed') or p_result is null then
    raise exception 'Invalid delivery result';
  end if;
  update draw_notifications.deliveries set
    status=case when p_result='retry' and attempts<3 then 'pending'
      when p_result='retry' then 'failed' else p_result end,
    next_attempt_at=case when p_result='retry' and attempts<3 then
      clock_timestamp()+make_interval(secs=>2*power(2,attempts-1)::integer) else null end,
    sent_at=case when p_result='sent' then clock_timestamp() else sent_at end,
    lease_token=null,lease_until=null
    where id=p_id and lease_token=p_lease and status='processing';
  get diagnostics affected=row_count;
  return affected=1;
end $$;
revoke all on function public.claim_draw_email(uuid,text,text) from public,anon,authenticated;
revoke all on function public.finish_draw_email(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_draw_email(uuid,text,text) to service_role;
grant execute on function public.finish_draw_email(uuid,uuid,text) to service_role;
