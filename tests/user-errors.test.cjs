const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const result = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/user-errors.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: result.exports });
const { userError } = result.exports;

test("internal error details never reach the displayed message", () => {
  const error = { message: 'SQL failure: private@example.invalid secret_token', details: 'secret_token', code: 'XX000' };
  assert.equal(userError(error, "save your wishlist"), "Could not save your wishlist. Check your connection and try again.");
});
test("missing errors still provide an action and recovery step", () => {
  for (const error of [null, undefined, "raw internal error", {}]) assert.match(userError(error, "send your message"), /Could not send your message.*try again/);
});
test("draw constraints keep specific guidance", () => {
  assert.match(userError({message:"Need at least 3 members to draw"}, "draw names"), /at least three/);
  assert.match(userError({message:"Could not find valid draw — check exclusion rules"}, "draw names"), /exclusions/);
});
test("permission and throttling failures explain next steps", () => {
  assert.match(userError({code:"42501",message:"internal"}, "save"), /recover access/);
  assert.match(userError({message:"rate limit exceeded"}, "save"), /wait/);
  assert.match(userError({message:"You can have up to 200 gifts per wishlist."}, "save"), /200-gift limit.*Remove a gift/);
  assert.match(userError({message:"You can have up to 30 wishlists."}, "save"), /30-wishlist limit.*existing wishlist/);
  assert.match(userError({message:"Wishlist not available."}, "save"), /Refresh the page.*recover access/);
  assert.equal(userError({message:"name resolution failed"}, "save the gift"), "Could not save the gift. Check your connection and try again.");
});
