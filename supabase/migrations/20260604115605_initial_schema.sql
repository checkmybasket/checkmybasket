
-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────
create type group_mode          as enum ('family','friends','workplace','students','custom');
create type draw_status         as enum ('pending','drawn','revealed');
create type wishlist_priority   as enum ('love','like','inspiration');
create type member_role         as enum ('organiser','member');
create type round_status        as enum ('open','closed','revealed');
create type gift_category       as enum (
  'mug','chocolate','bath_body','candle','cosy',
  'joke','book','drinks','gift_card','experience','useful','surprise'
);

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per Supabase auth user (including anonymous users).
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text,
  email       text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── groups ──────────────────────────────────────────────────────────────────
create table groups (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  mode              group_mode not null default 'friends',
  budget_amount     integer,          -- pence; null = no budget set
  budget_currency   text not null default 'GBP',
  exchange_date     date,
  exchange_location text,
  invite_code       text not null unique,
  draw_status       draw_status not null default 'pending',
  organiser_id      uuid not null references profiles(id),
  created_at        timestamptz not null default now()
);

create index groups_invite_code_idx on groups(invite_code);
create index groups_organiser_idx   on groups(organiser_id);

-- ─── group_members ───────────────────────────────────────────────────────────
create table group_members (
  id         uuid primary key default uuid_generate_v4(),
  group_id   uuid not null references groups(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       member_role not null default 'member',
  name       text not null,           -- display name chosen at join
  likes      text,
  dislikes   text,
  sizes      text,
  joined_at  timestamptz not null default now(),
  unique (group_id, user_id)
);

create index group_members_group_idx on group_members(group_id);
create index group_members_user_idx  on group_members(user_id);

-- ─── exclusions ──────────────────────────────────────────────────────────────
create table exclusions (
  id            uuid primary key default uuid_generate_v4(),
  group_id      uuid not null references groups(id) on delete cascade,
  user_a_id     uuid not null references profiles(id),
  user_b_id     uuid not null references profiles(id),
  bidirectional boolean not null default true,
  constraint no_self_exclusion check (user_a_id <> user_b_id)
);

create index exclusions_group_idx on exclusions(group_id);

-- ─── draws ───────────────────────────────────────────────────────────────────
-- PRIVACY-CRITICAL: each giver can only see their own row.
-- The organiser cannot see who else drew who — enforced by RLS.
create table draws (
  id           uuid primary key default uuid_generate_v4(),
  group_id     uuid not null references groups(id) on delete cascade,
  giver_id     uuid not null references profiles(id),
  recipient_id uuid not null references profiles(id),
  gift_bought  boolean not null default false,
  drawn_at     timestamptz not null default now(),
  unique (group_id, giver_id),
  unique (group_id, recipient_id),
  constraint no_self_draw check (giver_id <> recipient_id)
);

create index draws_group_idx  on draws(group_id);
create index draws_giver_idx  on draws(giver_id);

-- ─── wishlist_items ──────────────────────────────────────────────────────────
create table wishlist_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  group_id   uuid not null references groups(id)   on delete cascade,
  title      text not null,
  url        text,
  price      integer,                -- pence
  shop_name  text,
  notes      text,
  priority   wishlist_priority not null default 'like',
  image_url  text,
  created_at timestamptz not null default now()
);

create index wishlist_user_group_idx on wishlist_items(user_id, group_id);
create index wishlist_group_idx      on wishlist_items(group_id);

-- Track "I'm getting this" to prevent duplicate buying (hidden from owner)
create table wishlist_claims (
  id              uuid primary key default uuid_generate_v4(),
  wishlist_item_id uuid not null references wishlist_items(id) on delete cascade,
  claimed_by      uuid not null references profiles(id),
  claimed_at      timestamptz not null default now(),
  unique (wishlist_item_id, claimed_by)
);

-- ─── anon_messages ───────────────────────────────────────────────────────────
create table anon_messages (
  id                uuid primary key default uuid_generate_v4(),
  group_id          uuid not null references groups(id) on delete cascade,
  sender_id         uuid not null references profiles(id),
  recipient_id      uuid not null references profiles(id),
  content           text not null check (char_length(content) <= 500),
  is_reply          boolean not null default false,
  parent_message_id uuid references anon_messages(id),
  created_at        timestamptz not null default now(),
  constraint no_self_message check (sender_id <> recipient_id)
);

create index anon_messages_recipient_idx on anon_messages(recipient_id);
create index anon_messages_sender_idx    on anon_messages(sender_id);
create index anon_messages_group_idx     on anon_messages(group_id);

-- View that hides sender_id from non-senders (anonymity guarantee)
create view anon_messages_safe as
  select
    id,
    group_id,
    case when sender_id = auth.uid() then sender_id else null end as sender_id,
    recipient_id,
    content,
    is_reply,
    parent_message_id,
    created_at
  from anon_messages
  where sender_id = auth.uid()
     or recipient_id = auth.uid();

-- Rate-limiting helper: count messages from a sender in a group today
create or replace function daily_message_count(p_sender uuid, p_group uuid)
returns integer language sql security definer as $$
  select count(*)::integer
  from anon_messages
  where sender_id = p_sender
    and group_id = p_group
    and created_at > now() - interval '24 hours';
$$;

-- ─── prediction_rounds ───────────────────────────────────────────────────────
create table prediction_rounds (
  id         uuid primary key default uuid_generate_v4(),
  group_id   uuid not null references groups(id) on delete cascade,
  status     round_status not null default 'open',
  created_at timestamptz not null default now(),
  closed_at  timestamptz,
  unique (group_id)   -- one active round per group
);

create index prediction_rounds_group_idx on prediction_rounds(group_id);

-- ─── predictions ─────────────────────────────────────────────────────────────
create table predictions (
  id                 uuid primary key default uuid_generate_v4(),
  round_id           uuid not null references prediction_rounds(id) on delete cascade,
  predictor_id       uuid not null references profiles(id),
  subject_id         uuid not null references profiles(id),
  predicted_category gift_category not null,
  created_at         timestamptz not null default now(),
  unique (round_id, predictor_id, subject_id),
  constraint no_self_prediction check (predictor_id <> subject_id)
);

create index predictions_round_idx     on predictions(round_id);
create index predictions_predictor_idx on predictions(predictor_id);

-- ─── actual_gifts ─────────────────────────────────────────────────────────────
create table actual_gifts (
  id              uuid primary key default uuid_generate_v4(),
  round_id        uuid not null references prediction_rounds(id) on delete cascade,
  recipient_id    uuid not null references profiles(id),
  actual_category gift_category not null,
  logged_by       uuid not null references profiles(id),
  created_at      timestamptz not null default now(),
  unique (round_id, recipient_id)
);

-- ─── Helper: is the current user a member of a group? ────────────────────────
create or replace function is_group_member(p_group_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from group_members
    where group_id = p_group_id
      and user_id  = auth.uid()
  );
$$;

-- ─── Helper: is the current user the organiser of a group? ───────────────────
create or replace function is_group_organiser(p_group_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from groups
    where id          = p_group_id
      and organiser_id = auth.uid()
  );
$$;

-- ─── Server-side draw function ───────────────────────────────────────────────
-- Runs derangement algorithm respecting exclusions; writes draws table.
-- Called by an Edge Function (not directly from client).
create or replace function execute_draw(p_group_id uuid)
returns void language plpgsql security definer as $$
declare
  v_members    uuid[];
  v_shuffled   uuid[];
  v_excl_a     uuid[];
  v_excl_b     uuid[];
  v_attempts   int := 0;
  v_valid      boolean;
  i            int;
begin
  -- Verify caller is the organiser
  if not is_group_organiser(p_group_id) then
    raise exception 'Only the organiser can draw names';
  end if;

  -- Get joined member IDs
  select array_agg(user_id order by random())
  into v_members
  from group_members
  where group_id = p_group_id;

  if array_length(v_members, 1) < 3 then
    raise exception 'Need at least 3 members to draw';
  end if;

  -- Get exclusion pairs
  select array_agg(user_a_id), array_agg(user_b_id)
  into v_excl_a, v_excl_b
  from exclusions
  where group_id = p_group_id;

  -- Attempt derangement up to 1000 times
  loop
    v_attempts := v_attempts + 1;
    if v_attempts > 1000 then
      raise exception 'Could not find valid draw — check exclusion rules';
    end if;

    -- Shuffle
    select array_agg(u order by random())
    into v_shuffled
    from unnest(v_members) u;

    v_valid := true;

    for i in 1..array_length(v_members, 1) loop
      -- No self-draw
      if v_members[i] = v_shuffled[i] then
        v_valid := false;
        exit;
      end if;

      -- Check exclusions
      if v_excl_a is not null then
        declare
          j int;
        begin
          for j in 1..array_length(v_excl_a, 1) loop
            if (v_members[i] = v_excl_a[j] and v_shuffled[i] = v_excl_b[j]) or
               (v_members[i] = v_excl_b[j] and v_shuffled[i] = v_excl_a[j]) then
              v_valid := false;
              exit;
            end if;
          end loop;
        end;
      end if;

      if not v_valid then exit; end if;
    end loop;

    exit when v_valid;
  end loop;

  -- Delete any existing draws for this group
  delete from draws where group_id = p_group_id;

  -- Insert the new draws
  for i in 1..array_length(v_members, 1) loop
    insert into draws (group_id, giver_id, recipient_id)
    values (p_group_id, v_members[i], v_shuffled[i]);
  end loop;

  -- Mark group as drawn
  update groups set draw_status = 'drawn' where id = p_group_id;
end;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table groups            enable row level security;
alter table group_members     enable row level security;
alter table exclusions        enable row level security;
alter table draws             enable row level security;
alter table wishlist_items    enable row level security;
alter table wishlist_claims   enable row level security;
alter table anon_messages     enable row level security;
alter table prediction_rounds enable row level security;
alter table predictions       enable row level security;
alter table actual_gifts      enable row level security;

-- profiles
create policy "Users can read any profile"   on profiles for select using (true);
create policy "Users manage own profile"     on profiles for all    using (id = auth.uid());

-- groups
create policy "Members can read their groups"   on groups for select using (is_group_member(id));
create policy "Authenticated users can create"  on groups for insert with check (auth.uid() is not null);
create policy "Organiser can update group"      on groups for update using (organiser_id = auth.uid());
create policy "Organiser can delete group"      on groups for delete using (organiser_id = auth.uid());

-- group_members
create policy "Members see their group's members" on group_members for select using (is_group_member(group_id));
create policy "Users can join a group"            on group_members for insert with check (user_id = auth.uid());
create policy "Members update own record"         on group_members for update using (user_id = auth.uid());
create policy "Members can leave (delete own)"    on group_members for delete using (user_id = auth.uid());

-- exclusions
create policy "Members view exclusions"      on exclusions for select using (is_group_member(group_id));
create policy "Organiser manages exclusions" on exclusions for all   using (is_group_organiser(group_id));

-- draws — PRIVACY CRITICAL
-- Each user can ONLY see their own draw row. Organiser gets no special access.
create policy "Giver sees only their own draw" on draws for select using (giver_id = auth.uid());
create policy "Giver marks gift as bought"     on draws for update using (giver_id = auth.uid());

-- wishlist_items
create policy "Members read group wishlists"  on wishlist_items for select using (is_group_member(group_id));
create policy "Owner manages own wishlist"    on wishlist_items for all    using (user_id = auth.uid());

-- wishlist_claims
create policy "Members see claims in group"   on wishlist_claims for select
  using (exists (select 1 from wishlist_items w where w.id = wishlist_item_id and is_group_member(w.group_id)));
create policy "Members claim items"           on wishlist_claims for insert
  with check (claimed_by = auth.uid());
create policy "Members unclaim items"         on wishlist_claims for delete
  using (claimed_by = auth.uid());

-- anon_messages (base table — prefer anon_messages_safe view for reads)
create policy "Sender or recipient can read" on anon_messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "Members can send (rate-limited in app layer)" on anon_messages for insert
  with check (
    sender_id = auth.uid()
    and is_group_member(group_id)
    and daily_message_count(auth.uid(), group_id) < 10
  );
create policy "Recipients can report (soft-delete via update)" on anon_messages for update
  using (recipient_id = auth.uid());

-- prediction_rounds
create policy "Members see their group's rounds" on prediction_rounds for select using (is_group_member(group_id));
create policy "Members create a round"           on prediction_rounds for insert with check (is_group_member(group_id));
create policy "Organiser closes/reveals round"   on prediction_rounds for update using (is_group_organiser(group_id));

-- predictions
-- Before reveal: predictors see only their own predictions.
-- After reveal: all group members see all predictions.
create policy "Predictor always sees own predictions" on predictions for select
  using (predictor_id = auth.uid());
create policy "All members see predictions after reveal" on predictions for select
  using (
    exists (
      select 1 from prediction_rounds pr
      where pr.id = round_id
        and pr.status = 'revealed'
        and is_group_member(pr.group_id)
    )
  );
create policy "Members submit predictions" on predictions for insert
  with check (
    predictor_id = auth.uid()
    and exists (select 1 from prediction_rounds pr where pr.id = round_id and is_group_member(pr.group_id))
  );

-- actual_gifts
create policy "Members see logged gifts after reveal" on actual_gifts for select
  using (
    exists (
      select 1 from prediction_rounds pr
      where pr.id = round_id
        and pr.status = 'revealed'
        and is_group_member(pr.group_id)
    )
  );
create policy "Recipients log their own gift" on actual_gifts for insert
  with check (recipient_id = auth.uid() and logged_by = auth.uid());
