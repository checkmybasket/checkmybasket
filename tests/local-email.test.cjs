const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const result = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("supabase/functions/_shared/local-email.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: result.exports, URL, fetch });
const { localEmailFetch } = result.exports;
const local = { enabled: "true", supabaseUrl: "http://kong:8000" };

test("production delivery retains the supplied fetch implementation", () => {
  const transport = () => {};
  assert.equal(localEmailFetch({}, transport), transport);
});
test("cloud origins cannot activate local capture", () => {
  for (const supabaseUrl of ["https://project.supabase.co", "http://remote.test", "https://kong"]) {
    assert.throws(() => localEmailFetch({ enabled: "true", supabaseUrl }));
  }
});
test("capture translates fixture mail without forwarding provider credentials", async () => {
  let request;
  const transport = localEmailFetch(local, async (url, init) => { request = {url,init}; return new Response("{}"); });
  await transport("https://api.resend.com/emails", { headers: {Authorization:"Bearer private-provider-key"}, body:JSON.stringify({from:"App <sender@example.invalid>",to:"test@example.invalid",subject:"Local fixture",text:"Test body"}) });
  assert.equal(request.url,"http://supabase_inbucket_checkmybasket-local:8025/api/v1/send");
  assert.equal(request.init.headers.Authorization,undefined);
  assert.equal(JSON.parse(request.init.body).To[0].Email,"test@example.invalid");
  assert.equal(JSON.stringify(request).includes("private-provider-key"),false);
});
test("real recipient domains are rejected before any capture request", async () => {
  let called=false;
  const transport=localEmailFetch(local,async()=>{called=true;return new Response("{}");});
  await assert.rejects(transport("https://api.resend.com/emails",{body:JSON.stringify({to:"person@example.com"})}));
  assert.equal(called,false);
});
