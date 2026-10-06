-- Add an owner-only backup to the existing bounded owner mutation RPC.
-- CREATE OR REPLACE retains its existing execute grants.
create or replace function public.manage_personal_wish(p_list uuid,p_id uuid,p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_position integer; v_other uuid; v_other_position integer;
begin
 perform 1 from personal_wishlist.lists where id=p_list and owner_id=auth.uid() for update;
 if not found then raise exception 'Wishlist not available.'; end if;
 select position into v_position from personal_wishlist.items where id=p_id and list_id=p_list;
 if not found then raise exception 'Gift not available.'; end if;
 if p_action='delete' then delete from personal_wishlist.items where id=p_id;
 elsif p_action='release' then
   -- Owner backup: disclose neither existence, buyer identity nor bought status.
   -- The list lock matches reservation creation, so clearing is serialized.
   delete from personal_wishlist.reservations where item_id=p_id;
 elsif p_action in ('up','down') then
   if p_action='up' then select id,position into v_other,v_other_position from personal_wishlist.items where list_id=p_list and position<v_position order by position desc limit 1;
   else select id,position into v_other,v_other_position from personal_wishlist.items where list_id=p_list and position>v_position order by position limit 1; end if;
   if v_other is not null then
     update personal_wishlist.items set position=case when id=p_id then v_other_position else v_position end where id in (p_id,v_other);
   end if;
 else raise exception 'Unknown action.'; end if;
end; $$;

