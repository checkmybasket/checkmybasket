-- SECURITY 03: knowing a round ID must not allow a nonmember to log a gift.
alter policy "Recipients log their own gift" on public.actual_gifts
  to authenticated
  with check (
    recipient_id = (select auth.uid())
    and logged_by = (select auth.uid())
    and exists (
      select 1 from public.prediction_rounds pr
      where pr.id = actual_gifts.round_id
        and public.is_group_member(pr.group_id)
    )
  );
