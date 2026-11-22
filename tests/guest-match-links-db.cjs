const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require(process.argv[2] || '@electric-sql/pglite');
const id = n => `ab220001-0000-4000-8000-${String(n).padStart(12, '0')}`;
(async () => {
  const db = new PGlite(); let checks = 0;
  const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
  const denied = async operation => { await assert.rejects(operation); checks++; };
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create schema request_security;
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create table auth.users(id uuid primary key,is_anonymous boolean,email text);
    create table public.groups(id uuid primary key,name text,organiser_id uuid,draw_status text,
      budget_amount integer,budget_currency text default 'GBP',exchange_date date);
    create table public.group_members(id uuid primary key,group_id uuid references groups(id),
      user_id uuid,name text,likes text,dislikes text,sizes text);
    create table public.draws(id uuid primary key,group_id uuid,giver_id uuid,recipient_id uuid,
      giver_member_id uuid,recipient_member_id uuid);
    create table public.exclusions(group_id uuid,user_a_id uuid,user_b_id uuid);
    create table public.wishlist_items(id uuid primary key,group_id uuid,user_id uuid,
      title text,notes text,created_at timestamptz default now());
    create table public.recovery_identities(user_id uuid primary key);
    insert into auth.users values('${id(1)}',false,'organiser@example.test'),
      ('${id(2)}',true,null),('${id(3)}',true,null),('${id(4)}',true,null),
      ('${id(5)}',false,'member@example.test');`);
  await db.exec(fs.readFileSync(path.join(__dirname, '../supabase/migrations/20261122140000_guest_match_links.sql'), 'utf8'));
  const as = uid => db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid || '']);
  const snapshot = async () => (await db.query(`select
    (select jsonb_agg(to_jsonb(m) order by id) from group_members m) as members,
    (select jsonb_agg(to_jsonb(d) order by id) from draws d) as matches,
    (select jsonb_agg(to_jsonb(e) order by group_id,user_a_id) from exclusions e) as exclusions`)).rows;
  // Both legacy user-based draws and future stable-member draws must work.
  for (const [group, stable] of [[10, false], [20, true]]) {
    await db.query("insert into groups(id,name,organiser_id,draw_status) values($1,'QA draw',$2,'drawn')", [id(group),id(1)]);
    for (let user = 1; user <= 5; user++) {
      await db.query('insert into group_members(id,group_id,user_id,name) values($1,$2,$3,$4)', [id(group*10+user),id(group),id(user),`Participant ${user}`]);
      const recipient = user === 5 ? 1 : user+1;
      await db.query('insert into draws values($1,$2,$3,$4,$5,$6)', [id(group*100+user),id(group),id(user),id(recipient),stable?id(group*10+user):null,stable?id(group*10+recipient):null]);
    }
    await db.query('insert into exclusions values($1,$2,$3)', [id(group),id(2),id(4)]);
  }
  const before = await snapshot();
  await as(id(1));
  const links = async group => (await db.query('select * from get_guest_match_links($1)', [id(group)])).rows;
  const read = async token => (await db.query('select read_guest_match($1) as match', [token])).rows[0].match;
  const first = await links(10), future = await links(20);
  check(first.length,3); check(future.length,3);
  check(await links(10),first); // Reopening controls must not invalidate distributed links.
  for (const link of [...first,...future]) {
    const match = await read(link.token);
    check(match.participant_name,link.participant_name);
    check(match.recipient_name,`Participant ${Number(link.participant_name.at(-1))+1}`);
    check(Object.keys(match).sort(),['group_name','participant_name','recipient_name','budget_amount','budget_currency','exchange_date','likes','dislikes','sizes','wishlist'].sort());
  }
  check(await read(id(99999)),null); check(await read(null),null);
  await as(id(2)); await denied(links(10));
  await as(id(999)); await denied(links(10));
  await as(null); await denied(links(10));
  await db.exec('set role anon');
  await denied(db.query('select * from request_security.guest_match_links'));
  await denied(links(10)); check((await read(first[0].token)).participant_name,first[0].participant_name);
  await db.exec('reset role; set role authenticated');
  await denied(db.query('select * from request_security.guest_match_links'));
  await db.exec('reset role');
  await db.query("update guest_match_links set expires_at=now()-interval '1 second' where member_id=$1".replace('update guest_match_links','update request_security.guest_match_links'),[first[0].member_id]);
  check(await read(first[0].token),null);
  await as(id(1)); const renewed = await links(10);
  check(renewed.find(x=>x.member_id===first[0].member_id).token===first[0].token,false);
  check(await read(first[0].token),null);
  const recoveryGuest = first[1];
  await db.query('insert into recovery_identities values($1)',[id(Number(recoveryGuest.participant_name.at(-1)))]);
  check(await read(recoveryGuest.token),null); check((await links(10)).length,2);
  await db.query("update groups set draw_status='pending' where id=$1",[id(20)]);
  check(await read(future[0].token),null); await denied(links(20));
  check(await snapshot(),before);
  console.log(`guest match access: ${checks} assertions passed`);
  await db.close();
})().catch(error => { console.error(error); process.exitCode=1; });
