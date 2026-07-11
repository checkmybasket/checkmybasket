-- HARDENING 1: prediction round privacy.
-- A member could INSERT a prediction round with status='revealed' (the `status` column was
-- client-writable and the INSERT policy only checked group membership). Predictions submitted
-- into an already-revealed round are visible to everyone immediately, defeating the blind phase.
-- Force new rounds to start 'open'; the organiser-reveal path and the pg_cron auto-close remain
-- the only ways a round becomes 'revealed'.
DROP POLICY IF EXISTS "Members create a round" ON public.prediction_rounds;
CREATE POLICY "Members create a round" ON public.prediction_rounds
  FOR INSERT TO authenticated
  WITH CHECK (is_group_member(group_id) AND status = 'open');

-- HARDENING 2: groups creation path.
-- The "Authenticated users can create" INSERT policy allowed any signed-in user to insert a
-- groups row with an arbitrary organiser_id, invite_code, or draw_status. The app never inserts
-- groups directly — creation goes through the create_group() SECURITY DEFINER RPC — so remove the
-- direct client INSERT entirely (RPC is owner-run and bypasses this grant).
DROP POLICY IF EXISTS "Authenticated users can create" ON public.groups;
REVOKE INSERT ON public.groups FROM anon, authenticated;
