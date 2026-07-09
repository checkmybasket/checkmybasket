-- Dashboard wiring support (C1).

-- Organiser sees "6 of 8 gifts bought" without seeing who bought what.
-- draws RLS is giver-only, so the aggregate needs a SECURITY DEFINER RPC.
create or replace function public.gifts_bought_count(p_group_id uuid)
returns json
language sql stable security definer
set search_path = public, pg_temp
as $$
  select case when is_group_organiser(p_group_id) then
    json_build_object(
      'bought', (select count(*) from draws where group_id = p_group_id and gift_bought),
      'total',  (select count(*) from draws where group_id = p_group_id)
    )
  end;
$$;

revoke execute on function public.gifts_bought_count(uuid) from public, anon;
grant  execute on function public.gifts_bought_count(uuid) to authenticated;

-- A recipient replying to their Secret Santa cannot know the santa's user id
-- (that is the anonymity guarantee), so the reply is addressed server-side
-- from the parent message. Mirrors the INSERT policy's checks: membership is
-- implied by the parent, the caller must be the parent's recipient, and the
-- 10-messages/day limit still applies.
create or replace function public.reply_to_anon_message(p_parent_id uuid, p_content text)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_parent record;
begin
  if v_uid is null then
    raise exception 'Sign-in required';
  end if;
  if coalesce(trim(p_content), '') = '' or char_length(p_content) > 500 then
    raise exception 'Reply must be between 1 and 500 characters';
  end if;

  select group_id, sender_id, recipient_id into v_parent
  from anon_messages where id = p_parent_id;

  if v_parent is null or v_parent.recipient_id <> v_uid then
    raise exception 'You can only reply to messages sent to you';
  end if;
  if daily_message_count(v_uid, v_parent.group_id) >= 10 then
    raise exception 'Daily message limit reached (10 per group)';
  end if;

  insert into anon_messages (group_id, sender_id, recipient_id, content, is_reply, parent_message_id)
  values (v_parent.group_id, v_uid, v_parent.sender_id, trim(p_content), true, p_parent_id);
end;
$$;

revoke execute on function public.reply_to_anon_message(uuid, text) from public, anon;
grant  execute on function public.reply_to_anon_message(uuid, text) to authenticated;

-- "I'm getting this" claims must be hidden from the wishlist owner at the
-- database level, not just in the UI — otherwise the recipient can query
-- which of their items are already bought.
drop policy "Members see claims in group" on public.wishlist_claims;
create policy "Members see claims in group (not the item owner)" on public.wishlist_claims
  for select using (
    exists (
      select 1 from wishlist_items w
      where w.id = wishlist_item_id
        and is_group_member(w.group_id)
        and w.user_id <> auth.uid()
    )
  );
