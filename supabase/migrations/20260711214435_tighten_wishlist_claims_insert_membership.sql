-- Security fix: wishlist_claims INSERT only checked claimed_by = auth.uid(),
-- so any authenticated user could insert a claim row against an item in a group
-- they don't belong to. Require membership of the item's group, and block
-- claiming your own item (consistent with the SELECT policy that hides the
-- owner's own-item claims).
drop policy "Members claim items" on public.wishlist_claims;

create policy "Members claim items" on public.wishlist_claims
  for insert to public
  with check (
    claimed_by = auth.uid()
    and exists (
      select 1
      from public.wishlist_items wi
      where wi.id = wishlist_claims.wishlist_item_id
        and public.is_group_member(wi.group_id)
        and wi.user_id <> auth.uid()
    )
  );
