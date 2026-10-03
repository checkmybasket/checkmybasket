-- Independent personal lists. Private storage is reachable only through bounded,
-- deliberately granted RPCs. No group policy or existing group row is changed.
create schema if not exists personal_wishlist;
revoke all on schema personal_wishlist from public, anon, authenticated;

create table personal_wishlist.lists (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (length(btrim(title)) between 1 and 100),
 display_name text not null check (length(btrim(display_name)) between 1 and 80),
 occasion text not null default '' check (length(occasion) <= 80),
 event_date date,
 description text not null default '' check (length(description) <= 1000),
 share_token uuid not null unique default gen_random_uuid(),
 shared boolean not null default false,
 created_at timestamptz not null default now()
);
create index personal_lists_owner_idx on personal_wishlist.lists(owner_id);
create table personal_wishlist.items (
 id uuid primary key default gen_random_uuid(),
 list_id uuid not null references personal_wishlist.lists(id) on delete cascade,
 title text not null check (length(btrim(title)) between 1 and 200),
 url text not null default '' check (length(url) <= 2048 and (url = '' or url ~* '^https?://[^[:space:]]+$')),
 image_url text not null default '' check (length(image_url) <= 2048 and (image_url = '' or image_url ~* '^https?://[^[:space:]]+$')),
 price bigint check (price between 0 and 100000000),
 currency text not null default 'GBP' check (currency in ('GBP','USD','EUR','AUD','CAD')),
 shop_name text not null default '' check (length(shop_name) <= 100),
 notes text not null default '' check (length(notes) <= 1000),
 priority public.wishlist_priority not null default 'like',
 position integer not null default 0,
 created_at timestamptz not null default now()
);
create index personal_items_list_idx on personal_wishlist.items(list_id);
create table personal_wishlist.reservations (
 item_id uuid primary key references personal_wishlist.items(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 bought boolean not null default false,
 created_at timestamptz not null default now()
);
create index personal_reservations_user_idx on personal_wishlist.reservations(user_id);
create table personal_wishlist.metadata_limits (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null default now(), hits integer not null default 1
);
alter table personal_wishlist.lists enable row level security;
alter table personal_wishlist.items enable row level security;
alter table personal_wishlist.reservations enable row level security;
alter table personal_wishlist.metadata_limits enable row level security;
revoke all on all tables in schema personal_wishlist from public, anon, authenticated;

create function public.my_personal_wishlists() returns jsonb
language sql stable security definer set search_path = '' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id', l.id, 'title', l.title,
 'display_name',l.display_name,'occasion',l.occasion,'event_date',l.event_date,
 'description',l.description,'shared',l.shared,'share_token',l.share_token,
 'item_count',(select count(*) from personal_wishlist.items i where i.list_id=l.id)) order by l.created_at desc),'[]'::jsonb)
 from personal_wishlist.lists l where l.owner_id = auth.uid();
$$;

create function public.personal_wishlist_owner(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',l.id,'title',l.title,'display_name',l.display_name,
 'occasion',l.occasion,'event_date',l.event_date,'description',l.description,
 'shared',l.shared,'share_token',l.share_token,'items',
 coalesce((select jsonb_agg(to_jsonb(i) - 'list_id' order by i.position,i.created_at,i.id)
 from personal_wishlist.items i where i.list_id=l.id),'[]'::jsonb))
 from personal_wishlist.lists l where l.id=p_id and l.owner_id=auth.uid();
$$;

create function public.save_personal_wishlist(p_data jsonb, p_id uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_owner uuid := auth.uid();
begin
 if v_owner is null then raise exception 'Please start a session.'; end if;
 if p_id is null then
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
end; $$;

create function public.manage_personal_wishlist(p_id uuid,p_action text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_list personal_wishlist.lists;
begin
 select * into v_list from personal_wishlist.lists where id=p_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 if p_action='enable' then update personal_wishlist.lists set shared=true where id=p_id;
 elsif p_action='disable' then update personal_wishlist.lists set shared=false where id=p_id;
 elsif p_action='rotate' then update personal_wishlist.lists set share_token=gen_random_uuid() where id=p_id;
 elsif p_action='delete' then delete from personal_wishlist.lists where id=p_id; return null;
 else raise exception 'Unknown action.'; end if;
 return public.personal_wishlist_owner(p_id);
end; $$;

create function public.save_personal_wish(p_list uuid,p_data jsonb,p_id uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_position integer;
begin
 perform 1 from personal_wishlist.lists where id=p_list and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 if p_id is null then
   if (select count(*) from personal_wishlist.items where list_id=p_list) >= 200 then raise exception 'You can have up to 200 gifts per wishlist.'; end if;
   select coalesce(max(position),-1)+1 into v_position from personal_wishlist.items where list_id=p_list;
   insert into personal_wishlist.items(list_id,title,url,image_url,price,currency,shop_name,notes,priority,position)
   values(p_list,btrim(p_data->>'title'),coalesce(p_data->>'url',''),coalesce(p_data->>'image_url',''),nullif(p_data->>'price','')::bigint,
   coalesce(p_data->>'currency','GBP'),coalesce(p_data->>'shop_name',''),coalesce(p_data->>'notes',''),coalesce(p_data->>'priority','like')::public.wishlist_priority,v_position)
   returning id into v_id;
 else
   update personal_wishlist.items set title=btrim(p_data->>'title'),url=coalesce(p_data->>'url',''),image_url=coalesce(p_data->>'image_url',''),
   price=nullif(p_data->>'price','')::bigint,currency=coalesce(p_data->>'currency','GBP'),shop_name=coalesce(p_data->>'shop_name',''),
   notes=coalesce(p_data->>'notes',''),priority=coalesce(p_data->>'priority','like')::public.wishlist_priority
   where id=p_id and list_id=p_list returning id into v_id;
   if v_id is null then raise exception 'Gift not available.'; end if;
 end if;
 return v_id;
end; $$;

create function public.manage_personal_wish(p_list uuid,p_id uuid,p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_position integer; v_other uuid; v_other_position integer;
begin
 perform 1 from personal_wishlist.lists where id=p_list and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 select position into v_position from personal_wishlist.items where id=p_id and list_id=p_list;
 if not found then raise exception 'Gift not available.'; end if;
 if p_action='delete' then delete from personal_wishlist.items where id=p_id;
 elsif p_action in ('up','down') then
   if p_action='up' then select id,position into v_other,v_other_position from personal_wishlist.items where list_id=p_list and position<v_position order by position desc limit 1;
   else select id,position into v_other,v_other_position from personal_wishlist.items where list_id=p_list and position>v_position order by position limit 1; end if;
   if v_other is not null then
     update personal_wishlist.items set position=case when id=p_id then v_other_position else v_position end where id in (p_id,v_other);
   end if;
 else raise exception 'Unknown action.'; end if;
end; $$;

-- This intentionally public RPC returns only the fields a link holder may see.
-- It never returns identities, edit access, or the list's sharing capability.
create function public.shared_personal_wishlist(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',l.id,'title',l.title,'display_name',l.display_name,
 'occasion',l.occasion,'event_date',l.event_date,'description',l.description,'is_owner',l.owner_id=auth.uid(),
 'items',coalesce((select jsonb_agg((to_jsonb(i)-'list_id') || jsonb_build_object(
 'reserved', case when l.owner_id=auth.uid() then false else r.item_id is not null end,
 'bought',case when l.owner_id=auth.uid() then false else coalesce(r.bought,false) end,
 'mine',case when l.owner_id=auth.uid() then false else coalesce(r.user_id=auth.uid(),false) end)
 order by i.position,i.created_at,i.id) from personal_wishlist.items i
 left join personal_wishlist.reservations r on r.item_id=i.id where i.list_id=l.id),'[]'::jsonb))
 from personal_wishlist.lists l where l.share_token=p_token and l.shared;
$$;

create function public.reserve_personal_wish(p_token uuid,p_item uuid,p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_list personal_wishlist.lists; v_uid uuid := auth.uid(); v_claimer uuid;
begin
 if v_uid is null then raise exception 'Please start a session.'; end if;
 -- Same lock ordering as owner mutations: link revocation and deletion cannot race this operation.
 select * into v_list from personal_wishlist.lists where share_token=p_token and shared for update;
 if not found then raise exception 'This wishlist is no longer shared.'; end if;
 if v_list.owner_id=v_uid then raise exception 'You cannot reserve your own gifts.'; end if;
 perform 1 from personal_wishlist.items where id=p_item and list_id=v_list.id;
 if not found then raise exception 'Gift not available.'; end if;
 select user_id into v_claimer from personal_wishlist.reservations where item_id=p_item;
 if p_action='reserve' then
   if v_claimer=v_uid then return; end if;
   if v_claimer is not null then raise exception 'Someone else has just reserved this gift.'; end if;
   insert into personal_wishlist.reservations(item_id,user_id) values(p_item,v_uid);
 elsif p_action in ('release','bought') then
   if v_claimer is distinct from v_uid then raise exception 'Only the person who reserved this gift can change it.'; end if;
   if p_action='release' then delete from personal_wishlist.reservations where item_id=p_item;
   else update personal_wishlist.reservations set bought=true where item_id=p_item; end if;
 else raise exception 'Unknown action.'; end if;
end; $$;

create function public.my_personal_reservations() returns jsonb
language sql stable security definer set search_path = '' as $$
 select coalesce(jsonb_agg(jsonb_build_object('item_id',i.id,'title',i.title,'bought',r.bought,
 'list_title',l.title,'url',i.url,'shared',l.shared,'share_token',case when l.shared then l.share_token else null end)
 order by r.created_at desc),'[]'::jsonb)
 from personal_wishlist.reservations r join personal_wishlist.items i on i.id=r.item_id
 join personal_wishlist.lists l on l.id=i.list_id where r.user_id=auth.uid();
$$;

-- A reserver can undo their own promise even after the sharing link is disabled.
create function public.release_personal_reservation(p_item uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Please start a session.'; end if;
 delete from personal_wishlist.reservations where item_id=p_item and user_id=auth.uid();
end; $$;

create function public.personal_wishlist_recovery_access(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from personal_wishlist.lists where owner_id=p_user)
 or exists(select 1 from personal_wishlist.reservations where user_id=p_user);
$$;

create function public.personal_wishlist_metadata_allowed() returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_hits integer;
begin
 if auth.uid() is null then return false; end if;
 delete from personal_wishlist.metadata_limits where window_start < now()-interval '1 day';
 insert into personal_wishlist.metadata_limits(user_id) values(auth.uid())
 on conflict(user_id) do update set
 hits=case when personal_wishlist.metadata_limits.window_start<now()-interval '10 minutes' then 1 else personal_wishlist.metadata_limits.hits+1 end,
 window_start=case when personal_wishlist.metadata_limits.window_start<now()-interval '10 minutes' then now() else personal_wishlist.metadata_limits.window_start end
 returning hits into v_hits;
 return v_hits<=20;
end; $$;

revoke all on function public.my_personal_wishlists(),public.personal_wishlist_owner(uuid),public.save_personal_wishlist(jsonb,uuid),
 public.manage_personal_wishlist(uuid,text),public.save_personal_wish(uuid,jsonb,uuid),public.manage_personal_wish(uuid,uuid,text),
 public.shared_personal_wishlist(uuid),public.reserve_personal_wish(uuid,uuid,text),public.my_personal_reservations(),
 public.release_personal_reservation(uuid),public.personal_wishlist_recovery_access(uuid),public.personal_wishlist_metadata_allowed()
 from public,anon,authenticated;
grant execute on function public.my_personal_wishlists(),public.personal_wishlist_owner(uuid),public.save_personal_wishlist(jsonb,uuid),
 public.manage_personal_wishlist(uuid,text),public.save_personal_wish(uuid,jsonb,uuid),public.manage_personal_wish(uuid,uuid,text),
 public.reserve_personal_wish(uuid,uuid,text),public.my_personal_reservations(),public.release_personal_reservation(uuid),
 public.personal_wishlist_metadata_allowed() to authenticated;
grant execute on function public.shared_personal_wishlist(uuid) to anon,authenticated;
grant execute on function public.personal_wishlist_recovery_access(uuid) to service_role;
