alter table personal_wishlist.items
 add column state text not null default 'active' check(state in ('active','archived','received')),
 add column repeatable boolean not null default false;

create or replace function public.personal_wish_image(p_item uuid,p_token uuid default null) returns text
language sql stable security definer set search_path = '' as $$
 select nullif(i.image_url,'') from personal_wishlist.items i
 join personal_wishlist.lists l on l.id=i.list_id where i.id=p_item
 and (l.owner_id=auth.uid() or (l.shared and l.share_token=p_token and i.state='active'));
$$;

create function public.set_personal_wish_state(p_list uuid,p_id uuid,p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_state text;
begin
 perform 1 from personal_wishlist.lists where id=p_list and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 select state into v_state from personal_wishlist.items where id=p_id and list_id=p_list for update;
 if not found then raise exception 'Gift not available.'; end if;
 if p_action in ('archive','received') then
  update personal_wishlist.items set state=case when p_action='archive' then 'archived' else 'received' end where id=p_id;
 elsif p_action='restore' and v_state='archived' then
  update personal_wishlist.items set state='active' where id=p_id;
 elsif p_action='again' and v_state='received' then
  -- Explicit owner confirmation of receipt, never a timer or buyer event.
  delete from personal_wishlist.reservations where item_id=p_id;
  update personal_wishlist.items set state='active' where id=p_id;
 elsif p_action in ('repeat','oneoff') then
  update personal_wishlist.items set repeatable=(p_action='repeat') where id=p_id;
 else raise exception 'That gift action is not available. Refresh and try again.'; end if;
end; $$;
revoke all on function public.set_personal_wish_state(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.set_personal_wish_state(uuid,uuid,text) to authenticated;

create or replace function public.shared_personal_wishlist(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',l.id,'title',l.title,'display_name',l.display_name,
 'occasion',l.occasion,'event_date',l.event_date,'description',l.description,'reviewed_at',l.reviewed_at,'is_owner',l.owner_id=auth.uid(),
 'items',coalesce((select jsonb_agg((to_jsonb(i)-'list_id') || jsonb_build_object(
 'reserved',case when l.owner_id=auth.uid() then false else r.item_id is not null end,
 'bought',case when l.owner_id=auth.uid() then false else coalesce(r.bought,false) end,
 'mine',case when l.owner_id=auth.uid() then false else coalesce(r.user_id=auth.uid(),false) end)
 order by i.position,i.created_at,i.id) from personal_wishlist.items i
 left join personal_wishlist.reservations r on r.item_id=i.id where i.list_id=l.id and i.state='active'),'[]'::jsonb))
 from personal_wishlist.lists l where l.share_token=p_token and l.shared;
$$;

create or replace function public.reserve_personal_wish(p_token uuid,p_item uuid,p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_list personal_wishlist.lists; v_uid uuid := auth.uid(); v_claimer uuid;
begin
 if v_uid is null then raise exception 'Please start a session.'; end if;
 select * into v_list from personal_wishlist.lists where share_token=p_token and shared for update;
 if not found then raise exception 'This wishlist is no longer shared.'; end if;
 if v_list.owner_id=v_uid then raise exception 'You cannot reserve your own gifts.'; end if;
 perform 1 from personal_wishlist.items where id=p_item and list_id=v_list.id and state='active';
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
