-- SECURITY FIX: a group member could promote themselves to organiser by writing
-- group_members.role directly (UPDATE own row), or self-insert into any known
-- group_id as 'organiser', bypassing the create_group/join_group RPCs.
-- Root cause: the `authenticated` role held table-wide INSERT/UPDATE column grants
-- on group_members, and the RLS policies did not constrain which columns change.
--
-- Fix: revoke direct INSERT/UPDATE from clients. All membership creation flows through
-- the SECURITY DEFINER RPCs (create_group, join_group), which run as the table owner and
-- always set role server-side. Members may still self-edit only their own preference
-- columns (the sole direct writes the app performs), and may still leave (DELETE own row).

REVOKE INSERT, UPDATE ON public.group_members FROM anon, authenticated;

-- Re-grant only the self-service preference columns the client legitimately edits.
GRANT UPDATE (likes, dislikes, sizes, name) ON public.group_members TO authenticated;

-- Tighten the permissive self-insert policy so that even if an INSERT grant is ever
-- re-added, a client cannot mint itself an 'organiser' row.
DROP POLICY IF EXISTS "Users can join a group" ON public.group_members;
CREATE POLICY "Users can join a group" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'member');
