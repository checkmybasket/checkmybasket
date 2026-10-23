-- SECURITY 04: predictions must refer to another member of the same group.
alter policy "Members submit predictions" on public.predictions
  to authenticated
  with check (
    predictor_id = (select auth.uid())
    and exists (
      select 1 from public.prediction_rounds pr
      join public.group_members subject
        on subject.group_id = pr.group_id
        and subject.user_id = predictions.subject_id
      where pr.id = predictions.round_id
        and public.is_group_member(pr.group_id)
    )
  );
