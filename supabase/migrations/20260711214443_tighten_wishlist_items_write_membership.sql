-- Security fix: "Owner manages own wishlist" (FOR ALL) only checked
-- user_id = auth.uid(), leaving group_id unconstrained on writes, so a user
-- could insert/update an item into a group they aren't a member of.
-- Keep reads/deletes ownership-only (USING) so leave-group cleanup still works,
-- but constrain INSERT/UPDATE (WITH CHECK) to require group membership.
drop policy "Owner manages own wishlist" on public.wishlist_items;

create policy "Owner manages own wishlist" on public.wishlist_items
  for all to public
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_group_member(group_id));
