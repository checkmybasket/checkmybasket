import { createClient } from "jsr:@supabase/supabase-js@2.107.0";
import { handleReminderRequest } from "./handler.ts";
import { localEmailFetch } from "../_shared/local-email.ts";
const url = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
// verify_jwt=false because the worker authenticates a private, scoped scheduler token.
Deno.serve((req) =>
  handleReminderRequest(req, {
    rpc: (name, args) => admin.rpc(name, args),
    apiKey: Deno.env.get("RESEND_API_KEY"),
    from: Deno.env.get("EMAIL_FROM"),
    appUrl: Deno.env.get("APP_URL") ?? "https://www.checkmybasket.co.uk",
    fetcher: localEmailFetch({
      enabled: Deno.env.get("CMB_LOCAL_MAILPIT"),
      supabaseUrl: url,
    }),
  })
);
