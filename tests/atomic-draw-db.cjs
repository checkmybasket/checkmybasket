const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {PGlite}=require(process.argv[2]||'@electric-sql/pglite');
const dir=path.join(__dirname,'../supabase/migrations');
const file=fs.readdirSync(dir).find(x=>x.endsWith('_atomic_draw_finalisation.sql'));
const migration=fs.readFileSync(path.join(dir,file),'utf8');
const id=n=>'ab120001-0000-4000-8000-'+String(n).padStart(12,'0');
(async()=>{
 const db=new PGlite();let checks=0;
 const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid() returns uuid language sql stable as
 $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create type public.draw_status as enum('pending','drawn','revealed');
 create type public.group_mode as enum('friends','office');
 create type public.member_role as enum('member','organiser');
 create table profiles(id uuid primary key,name text,email text);
 create table groups(id uuid primary key default gen_random_uuid(),name text,mode group_mode,
 budget_amount integer,budget_currency text default 'GBP',exchange_date date,exchange_location text,
 invite_code text unique,draw_status draw_status default 'pending',organiser_id uuid,created_at timestamptz default now());
 create table group_members(id uuid primary key default gen_random_uuid(),group_id uuid references groups(id),
 user_id uuid references profiles(id),name text,role member_role default 'member',likes text,dislikes text,sizes text,
 unique(group_id,user_id));
 create table draws(id uuid primary key default gen_random_uuid(),group_id uuid references groups(id),
 giver_id uuid references profiles(id),recipient_id uuid references profiles(id),gift_bought boolean default false,
 drawn_at timestamptz default now(),unique(group_id,giver_id),unique(group_id,recipient_id),check(giver_id<>recipient_id));
 create table exclusions(group_id uuid references groups(id),user_a_id uuid,user_b_id uuid);
 create table test_receipts(draw_id uuid primary key references draws(id) on delete cascade);
 alter table groups enable row level security;
 create policy details_owner on groups for update using(organiser_id=auth.uid());
 create policy details_read on groups for select using(true);
 grant select,update on groups to anon,authenticated;
 insert into profiles(id) values('${id(2)}'),('${id(3)}'),('${id(4)}'),('${id(5)}'),('${id(6)}');`);
 await db.exec(migration);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);
 const setup=async(g,n)=>{
  await db.query('insert into groups(id,name,mode,invite_code,organiser_id) values($1,$2,$3,$4,$5)',[id(g),'QA','friends','code-'+g,id(2)]);
  for(let k=2;k<2+n;k++)await db.query('insert into group_members(group_id,user_id,name,role) values($1,$2,$3,$4)',[id(g),id(k),'QA',k===2?'organiser':'member']);
 };
 const run=async g=>db.query('select public.execute_draw($1)',[id(g)]);
 const matches=async g=>(await db.query('select * from draws where group_id=$1 order by giver_id',[id(g)])).rows;
 const status=async g=>(await db.query('select draw_status from groups where id=$1',[id(g)])).rows[0].draw_status;
 await setup(10,4);
 await db.query('insert into exclusions values($1,$2,$3)',[id(10),id(2),id(3)]);
 await Promise.all(Array.from({length:12},()=>run(10)));
 let rows=await matches(10);check(rows.length,4);check(await status(10),'drawn');
 check(new Set(rows.map(x=>x.giver_id)).size,4);check(new Set(rows.map(x=>x.recipient_id)).size,4);
 check(rows.some(x=>x.giver_id===x.recipient_id),false);
 check(rows.some(x=>(x.giver_id===id(2)&&x.recipient_id===id(3))||(x.giver_id===id(3)&&x.recipient_id===id(2))),false);
 await db.exec("insert into test_receipts select id from draws");
 await run(10);check(await matches(10),rows);check((await db.query('select count(*)::integer as n from test_receipts')).rows[0].n,4);
 await db.query("update groups set draw_status='revealed' where id=$1",[id(10)]);await run(10);
 check(await matches(10),rows);check(await status(10),'revealed');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(3)]);
 await assert.rejects(run(10),/Only the organiser/);checks++;
 await db.query("select set_config('request.jwt.claim.sub','',false)");
 await assert.rejects(run(10),/Only the organiser/);checks++;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);
 for(let [g,n]of [[20,0],[21,2]]){
  await setup(g,n);await assert.rejects(run(g),/at least 3/);checks++;
  check(await status(g),'pending');check((await matches(g)).length,0);
 }
 await setup(30,3);
 for(let [a,b]of [[2,3],[2,4],[3,4]])await db.query('insert into exclusions values($1,$2,$3)',[id(30),id(a),id(b)]);
 await assert.rejects(run(30),/Could not find valid draw/);checks++;
 check(await status(30),'pending');check((await matches(30)).length,0);
 await setup(40,3);await db.query('insert into draws(group_id,giver_id,recipient_id) values($1,$2,$3)',[id(40),id(2),id(3)]);
 let partial=await matches(40);await assert.rejects(run(40),/Existing matches cannot be replaced/);checks++;
 check(await matches(40),partial);check(await status(40),'pending');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(6)]);
 await assert.rejects(db.query('select public.join_group($1,$2)', ['code-10','QA late']),/already been drawn/);checks++;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(2)]);
 await db.query('select public.join_group($1,$2)', ['code-10','QA updated']);
 check(await matches(10),rows);
 await db.exec('set role authenticated');
 await db.query('update groups set name=$1 where id=$2',['QA changed',id(10)]);checks++;
 await assert.rejects(db.query("update groups set draw_status='pending' where id=$1",[id(10)]),/permission denied/);checks++;
 await assert.rejects(db.query('update groups set organiser_id=$1 where id=$2',[id(3),id(10)]),/permission denied/);checks++;
 await db.exec('reset role');
 check((await db.query("select has_column_privilege('anon','public.groups','draw_status','UPDATE') as allowed")).rows[0].allowed,false);
 check(await matches(10),rows);
 await db.close();console.log(`${checks} atomic draw PostgreSQL checks passed; isolated database closed.`);
})().catch(e=>{console.error(e.message);process.exit(1);});
