-- C2: recipients must never be able to read sender_id, even via raw PostgREST.
-- The old approach (masking view anon_messages_safe, SECURITY DEFINER) left the
-- base table readable with full column grants. New approach: column-level
-- privileges on the base table, view removed entirely.
-- Clients must select explicit columns (select=* will be denied) and infer
-- direction with: recipient_id = auth.uid() ? received : sent.

drop view if exists public.anon_messages_safe;

revoke all on public.anon_messages from anon, authenticated;

-- Read: every column EXCEPT sender_id. RLS still restricts rows to
-- sender (via internal policy check) or recipient.
grant select (id, group_id, recipient_id, content, is_reply, parent_message_id, created_at)
  on public.anon_messages to authenticated;

-- Write: sender_id is needed at insert time (RLS checks sender_id = auth.uid());
-- id/created_at come from defaults.
grant insert (group_id, sender_id, recipient_id, content, is_reply, parent_message_id)
  on public.anon_messages to authenticated;

-- C3: the old "report" policy let recipients UPDATE any column of messages
-- sent to them (no WITH CHECK, full column grants) — i.e. rewrite content or
-- sender_id. Add a dedicated flag and restrict the grant to that single column.
alter table public.anon_messages add column reported boolean not null default false;
grant select (reported) on public.anon_messages to authenticated;
grant update (reported) on public.anon_messages to authenticated;

drop policy "Recipients can report (soft-delete via update)" on public.anon_messages;
create policy "Recipients can report messages" on public.anon_messages
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
