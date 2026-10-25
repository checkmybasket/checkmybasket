alter table personal_wishlist.lists add column reviewed_at timestamptz;

create function personal_wishlist.invalidate_review() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if tg_table_name='items' then
   update personal_wishlist.lists set reviewed_at=null where id=coalesce(new.list_id,old.list_id);
   return coalesce(new,old);
 end if;
 new.reviewed_at := null; return new;
end; $$;
revoke all on function personal_wishlist.invalidate_review() from public,anon,authenticated;
create trigger wishlist_content_changed before update of title,display_name,occasion,event_date,description
 on personal_wishlist.lists for each row execute function personal_wishlist.invalidate_review();
create trigger wish_content_changed after insert or update or delete on personal_wishlist.items
 for each row execute function personal_wishlist.invalidate_review();

create function public.review_personal_wishlist(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 update personal_wishlist.lists set reviewed_at=now() where id=p_id and owner_id=auth.uid();
 if not found then raise exception 'Wishlist not available.'; end if;
end; $$;
revoke all on function public.review_personal_wishlist(uuid) from public,anon,authenticated;
grant execute on function public.review_personal_wishlist(uuid) to authenticated;

create or replace function public.personal_wishlist_owner(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',l.id,'title',l.title,'display_name',l.display_name,
 'occasion',l.occasion,'event_date',l.event_date,'description',l.description,'reviewed_at',l.reviewed_at,
 'shared',l.shared,'share_token',l.share_token,'items',
 coalesce((select jsonb_agg(to_jsonb(i)-'list_id' order by i.position,i.created_at,i.id)
 from personal_wishlist.items i where i.list_id=l.id),'[]'::jsonb))
 from personal_wishlist.lists l where l.id=p_id and l.owner_id=auth.uid();
$$;
create or replace function public.shared_personal_wishlist(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',l.id,'title',l.title,'display_name',l.display_name,
 'occasion',l.occasion,'event_date',l.event_date,'description',l.description,'reviewed_at',l.reviewed_at,'is_owner',l.owner_id=auth.uid(),
 'items',coalesce((select jsonb_agg((to_jsonb(i)-'list_id') || jsonb_build_object(
 'reserved',case when l.owner_id=auth.uid() then false else r.item_id is not null end,
 'bought',case when l.owner_id=auth.uid() then false else coalesce(r.bought,false) end,
 'mine',case when l.owner_id=auth.uid() then false else coalesce(r.user_id=auth.uid(),false) end)
 order by i.position,i.created_at,i.id) from personal_wishlist.items i
 left join personal_wishlist.reservations r on r.item_id=i.id where i.list_id=l.id),'[]'::jsonb))
 from personal_wishlist.lists l where l.share_token=p_token and l.shared;
$$;
