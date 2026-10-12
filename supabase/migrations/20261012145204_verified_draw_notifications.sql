-- Notification preference remains profiles.email; recovery proof alone never opts in.
create function draw_notifications.email_verified(p_user uuid,p_email text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.recovery_identities r join auth.users u on u.id=r.user_id
 where r.user_id=p_user and r.auth_ready and r.verified_at is not null
 and u.email_confirmed_at is not null
 and lower(btrim(r.email))=lower(btrim(p_email))
 and lower(btrim(u.email))=lower(btrim(p_email))
 and nullif(btrim(p_email),'') is not null);
$$;
revoke all on function draw_notifications.email_verified(uuid,text) from public,anon,authenticated;
-- Helper is not a public endpoint; privilege exists only for service claim internals.
grant execute on function draw_notifications.email_verified(uuid,text) to service_role;
create function public.get_notification_status() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_email text; v_verified text;
begin
 if v_uid is null then raise exception 'Please start a session.' using errcode='42501';end if;
 select email into v_email from public.profiles where id=v_uid;
 select r.email into v_verified from public.recovery_identities r
 where r.user_id=v_uid and draw_notifications.email_verified(v_uid,r.email);
 return jsonb_build_object('email',v_email,'verified_email',v_verified,'state',
 case when nullif(btrim(v_email),'') is null then 'off'
 when draw_notifications.email_verified(v_uid,v_email) then 'verified' else 'pending' end);
end; $$;
revoke all on function public.get_notification_status() from public,anon,service_role;
grant execute on function public.get_notification_status() to authenticated;
create or replace function public.set_my_email(p_email text) returns void
language plpgsql security definer set search_path='' as $$
declare v_norm text:=nullif(btrim(lower(p_email)),'');
begin
 if auth.uid() is null then raise exception 'Please start a session.' using errcode='42501';end if;
 if v_norm is not null and (length(v_norm)>254 or v_norm !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$') then raise exception 'Invalid email address';end if;
 update public.profiles set email=v_norm where id=auth.uid();
end; $$;
CREATE OR REPLACE FUNCTION public.claim_draw_email(p_draw_id uuid, p_payload_hash text, p_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
      and draw_notifications.email_verified(d.giver_id,p.email)
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
end $function$
;
