create table personal_wishlist.reminder_preferences (
 list_id uuid primary key references personal_wishlist.lists(id) on delete cascade,
 enabled boolean not null default false,
 yearly boolean not null default false,
 unsubscribe_token uuid not null unique default gen_random_uuid(),
 consented_at timestamptz not null default now()
);
create table personal_wishlist.reminder_jobs (
 id uuid primary key default gen_random_uuid(),
 list_id uuid not null references personal_wishlist.lists(id) on delete cascade,
 event_date date not null,
 kind text not null check(kind in ('before','after')),
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','cancelled')),
 attempts integer not null default 0,
 first_attempt_at timestamptz,
 claimed_at timestamptz,
 sent_at timestamptz,
 unique(list_id,event_date,kind)
);
create index reminder_jobs_pending_idx on personal_wishlist.reminder_jobs(status,claimed_at);
create table personal_wishlist.reminder_worker (
 singleton boolean primary key default true check(singleton), token_hash text not null
);
alter table personal_wishlist.reminder_preferences enable row level security;
alter table personal_wishlist.reminder_jobs enable row level security;
alter table personal_wishlist.reminder_worker enable row level security;
revoke all on personal_wishlist.reminder_preferences,personal_wishlist.reminder_jobs,personal_wishlist.reminder_worker from public,anon,authenticated;

-- Private calendar helper: London calendar days, including year boundaries and Feb 29.
create function personal_wishlist.reminder_events(p_date date,p_yearly boolean,p_today date)
returns table(event_date date,kind text,due date) language sql immutable set search_path='' as $$
 with years as (select generate_series(extract(year from p_today)::int-1,extract(year from p_today)::int+1) y),
 dates as (
 select make_date(y,extract(month from p_date)::int,least(extract(day from p_date)::int,
 extract(day from (make_date(y,extract(month from p_date)::int,1)+interval '1 month - 1 day'))::int)) d from years where p_yearly
 union all select p_date where not p_yearly and p_date is not null
 ) select d,k,case when k='before' then d-21 else d+3 end from dates cross join (values('before'),('after')) kinds(k);
$$;
revoke all on function personal_wishlist.reminder_events(date,boolean,date) from public,anon,authenticated;

create function public.wishlist_reminder_settings(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('enabled',coalesce(p.enabled,false),'yearly',coalesce(p.yearly,false),
 'verified',exists(select 1 from public.recovery_identities r join auth.users u on u.id=r.user_id
 where r.user_id=l.owner_id and r.auth_ready and r.verified_at is not null and u.email_confirmed_at is not null and u.email=r.email))
 from personal_wishlist.lists l left join personal_wishlist.reminder_preferences p on p.list_id=l.id
 where l.id=p_id and l.owner_id=auth.uid();
$$;
create function public.set_wishlist_reminders(p_id uuid,p_enabled boolean,p_yearly boolean default false) returns void
language plpgsql security definer set search_path='' as $$
declare l personal_wishlist.lists;
begin
 select * into l from personal_wishlist.lists where id=p_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 if p_enabled and (l.event_date is null or not exists(select 1 from public.recovery_identities r join auth.users u on u.id=r.user_id
 where r.user_id=l.owner_id and r.auth_ready and r.verified_at is not null and u.email_confirmed_at is not null and u.email=r.email))
 then raise exception 'Add an occasion date and verify your recovery email before enabling reminders.'; end if;
 insert into personal_wishlist.reminder_preferences(list_id,enabled,yearly) values(p_id,p_enabled,p_yearly)
 on conflict(list_id) do update set enabled=excluded.enabled,yearly=excluded.yearly,consented_at=now();
end; $$;
create function public.unsubscribe_wishlist_reminders(p_token uuid) returns void
language sql security definer set search_path='' as $$
 update personal_wishlist.reminder_preferences set enabled=false where unsubscribe_token=p_token;
$$;
revoke all on function public.wishlist_reminder_settings(uuid),public.set_wishlist_reminders(uuid,boolean,boolean),public.unsubscribe_wishlist_reminders(uuid) from public,anon,authenticated;
grant execute on function public.wishlist_reminder_settings(uuid),public.set_wishlist_reminders(uuid,boolean,boolean) to authenticated;
grant execute on function public.unsubscribe_wishlist_reminders(uuid) to anon,authenticated;

-- These endpoints are service-role-only. Scheduler credentials are scoped to this worker.
create function public.authenticate_wishlist_reminder_worker(p_key text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from personal_wishlist.reminder_worker where token_hash=encode(extensions.digest(p_key,'sha256'),'hex'));
$$;
create function public.claim_wishlist_reminders() returns jsonb
language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'Europe/London')::date; result jsonb;
begin
 update personal_wishlist.reminder_jobs set status='failed' where status in ('pending','sending') and first_attempt_at<now()-interval '23 hours';
 insert into personal_wishlist.reminder_jobs(list_id,event_date,kind)
 select l.id,e.event_date,e.kind from personal_wishlist.lists l
 join personal_wishlist.reminder_preferences p on p.list_id=l.id and p.enabled
 join public.recovery_identities r on r.user_id=l.owner_id and r.auth_ready and r.verified_at is not null
 join auth.users u on u.id=r.user_id and u.email=r.email and u.email_confirmed_at is not null
 cross join lateral personal_wishlist.reminder_events(l.event_date,p.yearly,today) e
 where e.due between today-6 and today and (e.kind<>'before' or e.event_date>today)
 on conflict(list_id,event_date,kind) do nothing;
 with candidates as (
 select j.id from personal_wishlist.reminder_jobs j where
 (j.status='pending' or (j.status='sending' and j.claimed_at<now()-interval '10 minutes'))
 and j.attempts<3 and (j.first_attempt_at is null or j.first_attempt_at>now()-interval '23 hours')
 order by j.id for update skip locked limit 50
 ), claimed as (
 update personal_wishlist.reminder_jobs j set status='sending',attempts=j.attempts+1,claimed_at=now(),first_attempt_at=coalesce(j.first_attempt_at,now())
 from candidates c where j.id=c.id returning j.id
 ) select coalesce(jsonb_agg(id),'[]'::jsonb) into result from claimed;
 return result;
end; $$;
create function public.wishlist_reminder_delivery(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',j.id,'list_id',l.id,'title',l.title,'email',r.email,'kind',j.kind,'event_date',j.event_date,'unsubscribe_token',p.unsubscribe_token)
 from personal_wishlist.reminder_jobs j join personal_wishlist.lists l on l.id=j.list_id
 join personal_wishlist.reminder_preferences p on p.list_id=l.id and p.enabled
 join public.recovery_identities r on r.user_id=l.owner_id and r.auth_ready and r.verified_at is not null
 join auth.users u on u.id=r.user_id and u.email=r.email and u.email_confirmed_at is not null
 where j.id=p_id and j.status='sending' and j.claimed_at>now()-interval '10 minutes'
 and exists(select 1 from personal_wishlist.reminder_events(l.event_date,p.yearly,(now() at time zone 'Europe/London')::date) e
 where e.event_date=j.event_date and e.kind=j.kind and e.due between (now() at time zone 'Europe/London')::date-6 and (now() at time zone 'Europe/London')::date
 and (e.kind<>'before' or e.event_date>(now() at time zone 'Europe/London')::date));
$$;
create function public.finish_wishlist_reminder(p_id uuid,p_status text) returns void
language sql security definer set search_path='' as $$
 update personal_wishlist.reminder_jobs set status=case when p_status='retry' and attempts<3 then 'pending' when p_status='sent' then 'sent' when p_status='cancelled' then 'cancelled' else 'failed' end,
 sent_at=case when p_status='sent' then now() else sent_at end where id=p_id and status='sending';
$$;
revoke all on function public.authenticate_wishlist_reminder_worker(text),public.claim_wishlist_reminders(),public.wishlist_reminder_delivery(uuid),public.finish_wishlist_reminder(uuid,text) from public,anon,authenticated;
grant execute on function public.authenticate_wishlist_reminder_worker(text),public.claim_wishlist_reminders(),public.wishlist_reminder_delivery(uuid),public.finish_wishlist_reminder(uuid,text) to service_role;
