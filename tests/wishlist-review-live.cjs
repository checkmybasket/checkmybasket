const assert = require('node:assert/strict');
const { createClient } = require('@supabase/supabase-js');
const { stagingEnv } = require('./helpers/staging-env.cjs');
const env = stagingEnv();
const client = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
async function rpc(c,name,args){const r=await c.rpc(name,args);if(r.error)throw r.error;return r.data}
(async()=>{const owner=client(),buyer=client();let id;
 try{
  assert.ifError((await owner.auth.signInAnonymously()).error);assert.ifError((await buyer.auth.signInAnonymously()).error);
  id=await rpc(owner,'save_personal_wishlist',{p_data:{title:'Review acceptance',display_name:'Local test'}});
  const item=await rpc(owner,'save_personal_wish',{p_list:id,p_data:{title:'Still wanted'}});
  const token=(await rpc(owner,'manage_personal_wishlist',{p_id:id,p_action:'enable'})).share_token;
  assert.ok((await buyer.rpc('review_personal_wishlist',{p_id:id})).error);
  await rpc(owner,'review_personal_wishlist',{p_id:id});
  const shared=await rpc(buyer,'shared_personal_wishlist',{p_token:token});assert.ok(shared.reviewed_at);
  await rpc(buyer,'reserve_personal_wish',{p_token:token,p_item:item,p_action:'reserve'});
  await rpc(buyer,'reserve_personal_wish',{p_token:token,p_item:item,p_action:'bought'});
  const own=await rpc(owner,'personal_wishlist_owner',{p_id:id});assert.equal(own.reviewed_at,shared.reviewed_at);assert.equal(own.items[0].bought,undefined);assert.equal(own.items[0].reserved,undefined);
  await rpc(owner,'save_personal_wish',{p_list:id,p_id:item,p_data:{title:'Updated wish'}});
  assert.equal((await rpc(buyer,'shared_personal_wishlist',{p_token:token})).reviewed_at,null);
  await rpc(owner,'review_personal_wishlist',{p_id:id});
  assert.equal((await rpc(owner,'personal_wishlist_owner',{p_id:id})).share_token,token);
  console.log('PASS: owner-only review, shared date, edit invalidation, purchase independence, hidden buyer data, stable sharing link');
 } finally {if(id)await rpc(owner,'manage_personal_wishlist',{p_id:id,p_action:'delete'});await owner.auth.signOut();await buyer.auth.signOut()}
})().catch(e=>{console.error(e.message);process.exit(1)});
