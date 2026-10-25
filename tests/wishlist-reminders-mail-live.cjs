// End-to-end local-only Auth, verified recovery, queue, Edge worker and Mailpit.
const assert=require('node:assert/strict');const crypto=require('node:crypto');const cp=require('node:child_process');
const {createClient}=require('@supabase/supabase-js');const {stagingEnv}=require('./helpers/staging-env.cjs');const e=stagingEnv();
if(process.env.CMB_TEST_PROJECT_REF!=='local'||e.NEXT_PUBLIC_SUPABASE_URL!=='http://127.0.0.1:54321')throw new Error('Local mail capture only');
const c=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
async function rpc(n,a){const r=await c.rpc(n,a);assert.ifError(r.error);return r.data}
async function inbox(){return (await fetch('http://127.0.0.1:54324/api/v1/messages')).json()}
async function waitMail(email,subject){for(let i=0;i<40;i++){const box=await inbox();const m=box.messages.find(m=>m.To.some(t=>t.Address===email)&&m.Subject===subject);if(m)return (await fetch(`http://127.0.0.1:54324/api/v1/message/${m.ID}`)).json();await new Promise(r=>setTimeout(r,250))}throw new Error('Captured email not received')}
function sql(query){const r=cp.spawnSync('docker',['exec','-i','supabase_db_checkmybasket-local','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-q'],{input:query,encoding:'utf8',env:{...process.env,DOCKER_HOST:'unix:///Users/hassan/.colima/cmb-staging/docker.sock'}});if(r.status)throw new Error(r.stderr);}
function date(offset){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return new Date(Date.parse(day+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10)}
(async()=>{let id;const email=`wishlist-${crypto.randomUUID()}@example.invalid`;try{
 assert.ifError((await c.auth.signInAnonymously()).error);id=await rpc('save_personal_wishlist',{p_data:{title:'Captured reminders',display_name:'Local owner',event_date:date(21)}});
 const setup=await c.functions.invoke('group-recovery',{body:{action:'setup',email,wishlist:true}});assert.ifError(setup.error);
 const verification=await waitMail(email,'Verify your email to save your CheckMyBasket access');const token=verification.Text.match(/\/return#token=([a-f0-9]{64})/)?.[1];assert(token);
 const redeemed=await c.functions.invoke('group-recovery',{body:{action:'redeem',token}});assert.ifError(redeemed.error);assert.ifError((await c.auth.setSession(redeemed.data)).error);
 assert.equal((await rpc('wishlist_reminder_settings',{p_id:id})).enabled,false,'Verification must not opt in');
 await rpc('set_wishlist_reminders',{p_id:id,p_enabled:true,p_yearly:false});
 sql("select personal_wishlist.configure_reminder_worker('http://kong:8000'); select personal_wishlist.dispatch_reminder_worker();");
 const before=await waitMail(email,'Is your wishlist ready for your next occasion?');assert(before.Text.includes(`/wishlists/${id}`));
 const unsub=before.Text.match(/\/wishlist-reminders#token=([a-f0-9-]{36})/)?.[1];assert(unsub);
 await new Promise(r=>setTimeout(r,1000));const count=(await inbox()).messages.filter(m=>m.To.some(t=>t.Address===email)).length;
 sql('select personal_wishlist.dispatch_reminder_worker();');await new Promise(r=>setTimeout(r,1500));assert.equal((await inbox()).messages.filter(m=>m.To.some(t=>t.Address===email)).length,count,'Duplicate email sent');
 await rpc('save_personal_wishlist',{p_id:id,p_data:{title:'Captured reminders',display_name:'Local owner',event_date:date(-3)}});
 sql('select personal_wishlist.dispatch_reminder_worker();');await waitMail(email,'Time to refresh your wishlist after your occasion?');
 const guest=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});assert.ifError((await guest.rpc('unsubscribe_wishlist_reminders',{p_token:unsub})).error);
 assert.equal((await rpc('wishlist_reminder_settings',{p_id:id})).enabled,false);
 console.log('PASS: verified-email opt-in, captured before/after emails, correct editor/unsubscribe links, authenticated scheduler, duplicate suppression and anonymous unsubscribe. No external email sent.');
}finally{if(id)await rpc('manage_personal_wishlist',{p_id:id,p_action:'delete'});await c.auth.signOut()}})().catch(e=>{console.error(e.message);process.exit(1)});
