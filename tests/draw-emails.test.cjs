const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cmb-draw-email-'));
for (const file of ['delivery', 'handler']) {
  const source = fs.readFileSync(path.join(__dirname, '../supabase/functions/send-draw-emails', file+'.ts'), 'utf8')
    .replaceAll('./delivery.ts', './delivery.js');
  fs.writeFileSync(path.join(tmp, file+'.js'), ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}
const { deliver, emailPayload } = require(path.join(tmp, 'delivery.js'));
const { handleRequest } = require(path.join(tmp, 'handler.js'));
const groupId = 'e0000000-0000-4000-8000-000000000001';
const payload = emailPayload('CheckMyBasket <sender@example.invalid>', 'https://www.checkmybasket.co.uk',
  groupId, '<QA group>', '<QA>', 'recipient@example.invalid');
const sleep = async () => {};
function ledger() {
  const jobs = new Map();
  return {
    jobs,
    async claim(id, hash) {
      let j = jobs.get(id);
      if (!j) { j = { id, hash, attempt: 0, state: 'pending' }; jobs.set(id, j); }
      if (j.state === 'processing') return { outcome: 'busy' };
      if (j.state !== 'pending') return { outcome: 'suppressed' };
      if (j.hash !== hash) { j.state = 'cancelled'; return { outcome: 'changed_payload' }; }
      j.state = 'processing'; j.attempt++; j.lease = 'lease-'+j.attempt;
      return { outcome: 'claimed', id, lease: j.lease, attempt: j.attempt };
    },
    async finish(id, lease, result) {
      const j = jobs.get(id);
      if (j.lease !== lease || j.state !== 'processing') return false;
      j.state = result === 'retry' && j.attempt < 3 ? 'pending' : result === 'retry' ? 'failed' : result;
      return true;
    },
  };
}
test('repeat and concurrent requests send one provider request per accepted recipient', async () => {
  const store = ledger(); let calls = 0;
  const provider = async () => { calls++; await new Promise(r=>setImmediate(r)); return new Response('{}'); };
  const results = await Promise.all(Array.from({length:8},()=>deliver('draw-a',payload,'fake-key',store,provider,sleep)));
  assert.equal(calls,1); assert.equal(results.filter(x=>x==='sent').length,1);
  assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'skipped');
});
test('transient errors retry the same body/key and accepted delivery stays suppressed', async () => {
  const store=ledger(), requests=[]; const delays=[];
  const provider=async (url,init)=>{requests.push(init);return new Response('{}',{status:requests.length===1?503:200});};
  assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,async ms=>delays.push(ms)),'sent');
  assert.equal(requests.length,2); assert.equal(requests[0].body,requests[1].body);
  assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
  assert.deepEqual(delays,[2000]);
});
test('429/network errors have a durable three-attempt maximum across invocations', async () => {
  for (const fail of [async()=>new Response('{}',{status:429}),async()=>{throw Error('network');}]) {
    const store=ledger();let calls=0;const provider=async()=>{calls++;return fail();};
    assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'failed');
    assert.equal(calls,3);
    assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'skipped');
    assert.equal(calls,3);
  }
});
test('permanent rejection is not retried and cannot reset the delivery record', async () => {
  const store=ledger();let calls=0;
  const provider=async()=>{calls++;return new Response('{}',{status:422});};
  assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'failed');
  assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'skipped');
  assert.equal(calls,1);
});
test('lost acknowledgement retries with stable provider key instead of sending a new email', async () => {
  const store=ledger();const accepted=new Set();let requests=0;
  const finish=store.finish;let lose=true;
  store.finish=async(...args)=>{if(lose){lose=false;throw Error('database unavailable');}return finish(...args);};
  const provider=async(url,init)=>{requests++;accepted.add(init.headers['Idempotency-Key']);return new Response('{}');};
  await assert.rejects(deliver('draw-a',payload,'fake-key',store,provider,sleep));
  store.jobs.get('draw-a').state='pending'; // expired processing lease after crash
  assert.equal(await deliver('draw-a',payload,'fake-key',store,provider,sleep),'sent');
  assert.equal(requests,2);assert.equal(accepted.size,1);
});
test('changed payload and ineligible/expired draws do not reach the provider', async () => {
  const store=ledger();let calls=0;
  await deliver('draw-a',payload,'fake-key',store,async()=>{calls++;return new Response('{}',{status:422});},sleep);
  store.jobs.get('draw-a').state='pending';
  assert.equal(await deliver('draw-a',{...payload,to:'changed@example.invalid'},'fake-key',store,async()=>{calls++;return new Response('{}');},sleep),'skipped');
  assert.equal(calls,1);
  assert.equal(await deliver('old',payload,'fake-key',{claim:async()=>({outcome:'ineligible'}),finish:async()=>true},async()=>{throw Error('must not send');},sleep),'skipped');
});
test('HTML escapes names and contains no Secret Santa assignment', () => {
  assert.match(payload.html,/&lt;QA group&gt;/); assert.match(payload.html,/&lt;QA&gt;/);
  assert.doesNotMatch(payload.html,/<QA/); assert.doesNotMatch(payload.text,/recipient_id|giver_id|invite_code/);
});
function deps(overrides={}) {
  return {authenticate:async()=> 'owner',group:async()=>({id:groupId,name:'QA',draw_status:'drawn',organiser_id:'owner'}),
    isOrganiserMember:async()=>true,recipients:async()=>[{drawId:'draw-a',name:'QA',email:'recipient@example.invalid'}],
    store:ledger(),apiKey:'fake-key',appUrl:'https://www.checkmybasket.co.uk',from:'sender@example.invalid',
    fetcher:async()=>new Response('{}'),sleep,...overrides};
}
const req=(body=JSON.stringify({group_id:groupId}))=>new Request('https://example.invalid',{method:'POST',body});
test('unauthenticated/non-organiser/pending requests never claim or send', async()=>{
  for (const [override,status] of [[{authenticate:async()=>null},401],[{authenticate:async()=> 'member'},403],
    [{isOrganiserMember:async()=>false},403],[{group:async()=>null},403],
    [{group:async()=>({id:groupId,name:'QA',draw_status:'pending',organiser_id:'owner'})},409]]) {
    let calls=0; const response=await handleRequest(req(),deps({...override,recipients:async()=>{calls++;return [];}}));
    assert.equal(response.status,status);assert.equal(calls,0);
  }
});
test('malformed/oversized requests and unsupported methods fail closed',async()=>{
  assert.equal((await handleRequest(req('{'),deps())).status,400);
  assert.equal((await handleRequest(req('{"group_id":"wrong"}'),deps())).status,400);
  assert.equal((await handleRequest(req('x'.repeat(4097)),deps())).status,413);
  assert.equal((await handleRequest(new Request('https://example.invalid'),deps())).status,405);
});
test('missing provider key never consumes claims and client receives only aggregate counts',async()=>{
  let claims=0;const d=deps({apiKey:undefined,store:{claim:async()=>{claims++;return {outcome:'claimed'};},finish:async()=>true}});
  assert.equal((await handleRequest(req(),d)).status,200);assert.equal(claims,0);
  const response=await handleRequest(req(),deps());const body=await response.json();
  assert.deepEqual(body,{sent:1,failed:0,skipped:0,total:1});
  assert.doesNotMatch(JSON.stringify(body),/example.invalid|draw-a|owner|lease|payload_hash/);
});
process.on('exit',()=>fs.rmSync(tmp,{recursive:true,force:true}));
