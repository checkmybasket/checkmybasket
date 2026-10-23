const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const result = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/supabase/origins.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: result.exports, URL });
const { supabaseConnectSources } = result.exports;

test("staging replaces production CSP endpoints and preserves the Realtime protocol", () => {
  assert.equal(supabaseConnectSources("https://staging.supabase.co"),
    "https://staging.supabase.co wss://staging.supabase.co");
});
test("local Supabase keeps the configured port for HTTP and WebSockets", () => {
  assert.equal(supabaseConnectSources("http://127.0.0.1:54321"),
    "http://127.0.0.1:54321 ws://127.0.0.1:54321");
});
test("insecure remote origins, credentials and header injection fail closed", () => {
  for (const value of ["http://staging.supabase.co", "https://user:pass@staging.supabase.co", "data:text/plain,test", "https://staging.supabase.co\n; connect-src *"]) {
    assert.throws(() => supabaseConnectSources(value));
  }
});
