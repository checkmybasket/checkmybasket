-- C3 (draws): the giver's UPDATE policy had no WITH CHECK and full column
-- grants, so a giver could alter recipient_id / giver_id on their own draw row.
-- All inserts/deletes happen inside the SECURITY DEFINER execute_draw() as the
-- table owner, so client roles need nothing beyond SELECT + gift_bought UPDATE.

revoke all on public.draws from anon, authenticated;

grant select (id, group_id, giver_id, recipient_id, gift_bought, drawn_at)
  on public.draws to authenticated;
grant update (gift_bought) on public.draws to authenticated;

drop policy "Giver marks gift as bought" on public.draws;
create policy "Giver marks gift as bought" on public.draws
  for update using (giver_id = auth.uid()) with check (giver_id = auth.uid());
