-- Read-only, participant-scoped links for guests who joined without recovery.
-- No participant, Auth identity, assignment or exclusion is rewritten.
create table request_security.guest_match_links (
  member_id uuid primary key references public.group_members(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default now() + interval '90 days'
);
alter table request_security.guest_match_links enable row level security;
revoke all on request_security.guest_match_links from public, anon, authenticated, service_role;

create function public.get_guest_match_links(p_group_id uuid)
returns table(member_id uuid, participant_name text, token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.groups g where g.id=p_group_id
    and g.organiser_id=auth.uid() and g.draw_status<>'pending' for update;
  if not found then raise exception 'Only the organiser of a completed draw can create personal match links'; end if;
  insert into request_security.guest_match_links as l (member_id)
    select m.id from public.group_members m join auth.users u on u.id=m.user_id
    where m.group_id=p_group_id and m.user_id<>auth.uid() and u.is_anonymous
      and coalesce(u.email,'')='' and not exists (
        select 1 from public.recovery_identities r where r.user_id=m.user_id
      ) and exists (select 1 from public.draws d where d.group_id=p_group_id
        and (d.giver_member_id=m.id or d.giver_id=m.user_id))
  on conflict on constraint guest_match_links_pkey do update
    set token=gen_random_uuid(), expires_at=now()+interval '90 days'
    where l.expires_at<=now();
  return query select m.id,m.name,l.token,l.expires_at
    from request_security.guest_match_links l
    join public.group_members m on m.id=l.member_id
    join auth.users u on u.id=m.user_id
    where m.group_id=p_group_id and m.user_id<>auth.uid() and u.is_anonymous
      and coalesce(u.email,'')='' and not exists (
        select 1 from public.recovery_identities r where r.user_id=m.user_id
      ) order by m.name,m.id;
end;
$$;

create function public.read_guest_match(p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'group_name',g.name,'participant_name',m.name,'recipient_name',recipient.name,
    'budget_amount',g.budget_amount,'budget_currency',g.budget_currency,
    'exchange_date',g.exchange_date,'likes',recipient.likes,
    'dislikes',recipient.dislikes,'sizes',recipient.sizes,
    'wishlist',coalesce((select jsonb_agg(jsonb_build_object('title',w.title,'notes',w.notes)
      order by w.created_at,w.id) from public.wishlist_items w
      where w.group_id=g.id and w.user_id=recipient.user_id),'[]'::jsonb))
  from request_security.guest_match_links l
  join public.group_members m on m.id=l.member_id
  join auth.users u on u.id=m.user_id
  join public.groups g on g.id=m.group_id
  join public.draws d on d.group_id=g.id and (d.giver_member_id=m.id or d.giver_id=m.user_id)
  join public.group_members recipient on recipient.group_id=g.id
    and (case when d.recipient_member_id is not null then recipient.id=d.recipient_member_id
      else recipient.user_id=d.recipient_id end)
  where l.token=p_token and l.expires_at>now() and g.draw_status<>'pending'
    and u.is_anonymous and coalesce(u.email,'')=''
    and not exists(select 1 from public.recovery_identities r where r.user_id=m.user_id);
$$;
revoke all on function public.get_guest_match_links(uuid), public.read_guest_match(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_guest_match_links(uuid) to authenticated;
grant execute on function public.read_guest_match(uuid) to anon, authenticated;
