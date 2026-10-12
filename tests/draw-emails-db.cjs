// Run with a temporary @electric-sql/pglite module path; never touches live data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require(process.argv[2] || '@electric-sql/pglite');
const migration = fs.readFileSync(path.join(__dirname,
  '../supabase/migrations/20261012094655_draw_email_delivery_guards.sql'), 'utf8');
const id = n => 'e0000000-0000-4000-8000-'+String(n).padStart(12,'0');
const hash = 'a'.repeat(64);
(async()=>{
  const db = new PGlite();let checks=0;
  const check = (value,expected) => {assert.deepEqual(value,expected);checks++;};
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create table public.groups(id uuid primary key,draw_status text);
    create table public.profiles(id uuid primary key,email text);
    create table public.group_members(group_id uuid,user_id uuid);
    create table public.draws(id uuid primary key,group_id uuid references public.groups(id),
      giver_id uuid references public.profiles(id),drawn_at timestamptz default now());
    insert into public.groups values('${id(1)}','drawn');
    insert into public.profiles values('${id(2)}','test@example.invalid');
    insert into public.group_members values('${id(1)}','${id(2)}');
    insert into public.draws(id,group_id,giver_id) values('${id(3)}','${id(1)}','${id(2)}');`);
  await db.exec(migration);
  const claim = async(draw=id(4),payload=hash,email='test@example.invalid')=> (await db.query(
    'select public.claim_draw_email($1,$2,$3) as job',[draw,payload,email])).rows[0].job;
  const finish = async(job,result,lease=job.lease)=>(await db.query(
    'select public.finish_draw_email($1,$2,$3) as ok',[job.id,lease,result])).rows[0].ok;
  const fresh=async(n)=>db.query('insert into public.draws(id,group_id,giver_id) values($1,$2,$3)',[id(n),id(1),id(2)]);
  check((await claim(id(3))).outcome,'suppressed'); // pre-migration draw never resent
  await fresh(4);
  await db.exec('set role service_role');
  const requests=await Promise.all(Array.from({length:12},()=>claim()));
  check(requests.filter(x=>x.outcome==='claimed').length,1);
  check(requests.filter(x=>x.outcome==='busy').length,11);
  const first=requests.find(x=>x.outcome==='claimed');
  check(first.attempt,1);
  check(await finish(first,'sent',id(100)),false); // stale/wrong worker token
  check(await finish(first,'sent'),true);
  check((await claim()).outcome,'suppressed');
  await db.exec('reset role');await fresh(5);
  let j=await claim(id(5));check(await finish(j,'retry'),true);
  check((await claim(id(5))).outcome,'cooldown');
  await db.exec(`update draw_notifications.deliveries set next_attempt_at=now()-interval '1 second' where draw_id='${id(5)}'`);
  let second=await claim(id(5));check(second.id,j.id);check(second.attempt,2);
  check(await finish(j,'sent'),false); // previous lease cannot acknowledge new attempt
  await finish(second,'retry');
  await db.exec(`update draw_notifications.deliveries set next_attempt_at=now()-interval '1 second' where draw_id='${id(5)}'`);
  let third=await claim(id(5));check(third.attempt,3);await finish(third,'retry');
  check((await claim(id(5))).outcome,'suppressed');
  await fresh(6);j=await claim(id(6));
  await db.exec(`update draw_notifications.deliveries set lease_until=now()-interval '1 second' where draw_id='${id(6)}'`);
  second=await claim(id(6));check(second.id,j.id);check(second.attempt,2);
  check(await finish(j,'sent'),false);await finish(second,'retry');
  check((await claim(id(6),'b'.repeat(64))).outcome,'changed_payload');
  await fresh(7);
  await db.exec(`update public.draws set drawn_at=now()-interval '23 hours 1 minute' where id='${id(7)}'`);
  check((await claim(id(7))).outcome,'ineligible');
  await fresh(8);await db.exec(`update public.profiles set email=null`);
  check((await claim(id(8))).outcome,'ineligible');
  await db.exec(`update public.profiles set email='changed@example.invalid'`);
  check((await claim(id(8))).outcome,'ineligible');
  await db.exec(`update public.profiles set email='test@example.invalid';update public.groups set draw_status='pending'`);
  check((await claim(id(8))).outcome,'ineligible');
  for(let role of ['anon','authenticated']){
    await db.exec('set role '+role);
    await assert.rejects(claim(id(8)),/permission denied/);checks++;
    await assert.rejects(db.query('select * from draw_notifications.deliveries'),/permission denied/);checks++;
    await db.exec('reset role');
  }
  check((await db.query(`select count(*)::integer as n from information_schema.columns
    where table_schema='draw_notifications' and column_name in ('email','name','body','html','text')`)).rows[0].n,0);
  await db.close();console.log(`${checks} PostgreSQL delivery guard checks passed; isolated in-memory database closed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
