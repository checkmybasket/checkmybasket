const assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js');const {stagingEnv}=require('./helpers/staging-env.cjs');const env=stagingEnv();
const client=()=>createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
async function rpc(c,n,a){const r=await c.rpc(n,a);if(r.error)throw r.error;return r.data}
(async()=>{const o=client(),b=client();let id,other;try{
 await o.auth.signInAnonymously();await b.auth.signInAnonymously();
 id=await rpc(o,'save_personal_wishlist',{p_data:{title:'Lifecycle test',display_name:'Local'}});other=await rpc(o,'save_personal_wishlist',{p_data:{title:'Other list',display_name:'Local'}});
 const item=await rpc(o,'save_personal_wish',{p_list:id,p_data:{title:'Coffee',image_url:'https://example.invalid/coffee.jpg'}});const token=(await rpc(o,'manage_personal_wishlist',{p_id:id,p_action:'enable'})).share_token;
 const set=action=>rpc(o,'set_personal_wish_state',{p_list:id,p_id:item,p_action:action});
 await rpc(b,'reserve_personal_wish',{p_token:token,p_item:item,p_action:'reserve'});await rpc(b,'reserve_personal_wish',{p_token:token,p_item:item,p_action:'bought'});
 assert.ok((await b.rpc('set_personal_wish_state',{p_list:id,p_id:item,p_action:'archive'})).error);assert.ok((await o.rpc('set_personal_wish_state',{p_list:other,p_id:item,p_action:'archive'})).error);
 await set('archive');assert.equal((await rpc(b,'shared_personal_wishlist',{p_token:token})).items.length,0);assert.ok((await b.rpc('reserve_personal_wish',{p_token:token,p_item:item,p_action:'reserve'})).error);
 assert.equal(await rpc(b,'personal_wish_image',{p_item:item,p_token:token}),null);assert.equal(await rpc(o,'personal_wish_image',{p_item:item}),'https://example.invalid/coffee.jpg');
 await set('restore');assert.equal((await rpc(b,'shared_personal_wishlist',{p_token:token})).items[0].bought,true);
 await set('repeat');await set('received');assert.equal((await rpc(b,'shared_personal_wishlist',{p_token:token})).items.length,0);
 assert.ok((await o.rpc('set_personal_wish_state',{p_list:id,p_id:item,p_action:'restore'})).error);
 await set('again');const fresh=(await rpc(b,'shared_personal_wishlist',{p_token:token})).items[0];assert.equal(fresh.reserved,false);assert.equal(fresh.repeatable,true);
 const own=(await rpc(o,'personal_wishlist_owner',{p_id:id})).items[0];assert.equal(own.bought,undefined);assert.equal(own.reserved,undefined);
 console.log('PASS: lifecycle permissions, cross-list denial, archived read/write denial, bought reservation retained on restore, explicit received reset, repeatable label, owner surprise protection');
}finally{for(const p_id of [id,other].filter(Boolean))await rpc(o,'manage_personal_wishlist',{p_id,p_action:'delete'});await o.auth.signOut();await b.auth.signOut()}})().catch(e=>{console.error(e.message);process.exit(1)});
