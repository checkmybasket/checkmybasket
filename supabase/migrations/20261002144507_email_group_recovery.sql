-- Recovery credentials are inaccessible to browser roles. Only the Edge Function
-- may issue/consume them; group/draw permissions continue to use the original uid.
create table public.recovery_identities (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null unique check (email = lower(btrim(email))),
  verified_at timestamptz,
  auth_ready boolean not null default false
);
create table public.recovery_tokens (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  group_id uuid references public.groups(id) on delete cascade,
  purpose text not null check (purpose in ('setup', 'login')),
  expires_at timestamptz not null default now() + interval '15 minutes',
  created_at timestamptz not null default now()
);
create table public.recovery_request_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  requests integer not null default 1
);
alter table public.recovery_identities enable row level security;
alter table public.recovery_tokens enable row level security;
alter table public.recovery_request_limits enable row level security;
revoke all on public.recovery_identities, public.recovery_tokens, public.recovery_request_limits from public, anon, authenticated;
grant all on public.recovery_identities, public.recovery_tokens, public.recovery_request_limits to service_role;
create index recovery_tokens_expiry_idx on public.recovery_tokens(expires_at);

-- Service-only and SECURITY INVOKER: no privileged browser-callable RPC.
create function public.recovery_rate_limit(p_key text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_requests integer;
begin
  if p_limit < 1 or p_limit > 100 or p_key !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid rate limit';
  end if;
  delete from public.recovery_request_limits where window_started_at < now() - interval '1 day';
  delete from public.recovery_tokens where expires_at <= now();
  insert into public.recovery_request_limits as r (key_hash) values (p_key)
  on conflict (key_hash) do update set
    requests = case when r.window_started_at <= now() - interval '10 minutes' then 1 else r.requests + 1 end,
    window_started_at = case when r.window_started_at <= now() - interval '10 minutes' then now() else r.window_started_at end
  returning requests into v_requests;
  return v_requests <= p_limit;
end;
$$;

-- DELETE RETURNING makes simultaneous redemption and replay impossible.
create function public.consume_recovery_token(p_hash text)
returns setof public.recovery_tokens language plpgsql security invoker set search_path = '' as $$
declare v_token public.recovery_tokens; v_identity public.recovery_identities;
begin
  select * into v_token from public.recovery_tokens where token_hash = p_hash for update;
  if not found or v_token.expires_at <= now() then return; end if;
  if not exists (select 1 from public.group_members m where m.user_id = v_token.user_id
    and (v_token.group_id is null or m.group_id = v_token.group_id)) then return; end if;
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
revoke all on function public.recovery_rate_limit(text, integer) from public, anon, authenticated;
revoke all on function public.consume_recovery_token(text) from public, anon, authenticated;
grant execute on function public.recovery_rate_limit(text, integer) to service_role;
grant execute on function public.consume_recovery_token(text) to service_role;
