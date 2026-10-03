-- Preserve one-use token and verified-address locking; permit personal-list identities.
create or replace function public.consume_recovery_token(p_hash text)
returns setof public.recovery_tokens language plpgsql security invoker set search_path = '' as $$
declare v_token public.recovery_tokens; v_identity public.recovery_identities;
begin
  select * into v_token from public.recovery_tokens where token_hash = p_hash for update;
  if not found or v_token.expires_at <= now() then return; end if;
  if v_token.group_id is not null then
    if not exists (select 1 from public.group_members m where m.user_id=v_token.user_id and m.group_id=v_token.group_id) then return; end if;
  elsif not exists (select 1 from public.group_members m where m.user_id=v_token.user_id)
    and not public.personal_wishlist_recovery_access(v_token.user_id) then return;
  end if;
  -- Reserve the verified address inside this transaction. A second setup link
  -- cannot race the Auth update and overwrite a different verified address.
  if v_token.purpose = 'setup' then
    insert into public.recovery_identities (user_id, email) values (v_token.user_id, v_token.email)
    on conflict do nothing;
  end if;
  select * into v_identity from public.recovery_identities where user_id = v_token.user_id for update;
  if not found or v_identity.email <> v_token.email or (v_token.purpose = 'login' and not v_identity.auth_ready) then return; end if;
  delete from public.recovery_tokens where token_hash = p_hash;
  return next v_token;
end;
$$;
