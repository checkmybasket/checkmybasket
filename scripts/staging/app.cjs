// Launch only the explicit local acceptance environment; never overwrite app env files.
const fs = require("node:fs");
const path = require("node:path");
const { parseEnv } = require("node:util");
const { spawnSync } = require("node:child_process");
const { stagingEnv } = require("../../tests/helpers/staging-env.cjs");
const root = path.resolve(__dirname, "../..");
const action = process.argv[2];
if (!["build", "start"].includes(action)) throw new Error("Use: node scripts/staging/app.cjs build|start");
const values = parseEnv(fs.readFileSync(path.join(root, ".env.staging.local"), "utf8"));
const checked = stagingEnv(values);
if (values.CMB_TEST_PROJECT_REF !== "local" ||
    values.NEXT_PUBLIC_SUPABASE_URL !== checked.NEXT_PUBLIC_SUPABASE_URL ||
    values.NEXT_PUBLIC_SUPABASE_ANON_KEY !== checked.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    checked.appUrl !== "http://localhost:3101") {
  throw new Error("Local staging requires matching loopback app/test credentials and http://localhost:3101.");
}
const args = [path.join(root, "node_modules/next/dist/bin/next"), action];
if (action === "start") args.push("--hostname", "127.0.0.1", "--port", "3101");
const result = spawnSync(process.execPath, args, {
  cwd: root, env: { ...process.env, ...values, VERCEL_ENV: "preview" }, stdio: "inherit",
});
if (result.error) throw new Error("Local staging process could not start.");
process.exit(result.status ?? 1);
