-- The preview proxy accepts only an item the caller may view; it is not a
-- general-purpose public URL fetcher. Actual sockets still enforce public IPs.
create function public.personal_wish_image(p_item uuid,p_token uuid default null) returns text
language sql stable security definer set search_path = '' as $$
 select nullif(i.image_url,'') from personal_wishlist.items i
 join personal_wishlist.lists l on l.id=i.list_id where i.id=p_item
 and (l.owner_id=auth.uid() or (l.shared and l.share_token=p_token));
$$;
revoke all on function public.personal_wish_image(uuid,uuid) from public,anon,authenticated;
grant execute on function public.personal_wish_image(uuid,uuid) to anon,authenticated;
