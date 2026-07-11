-- Round creation is now organiser-only (product decision). The UI already hides the
-- "Start the game" button from non-organisers; this enforces it at the data layer.
-- status='open' is retained so an organiser cannot mint a pre-revealed round either.
DROP POLICY IF EXISTS "Members create a round" ON public.prediction_rounds;
CREATE POLICY "Organiser creates a round" ON public.prediction_rounds
  FOR INSERT TO authenticated
  WITH CHECK (is_group_organiser(group_id) AND status = 'open');
