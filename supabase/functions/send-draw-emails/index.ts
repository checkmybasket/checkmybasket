// send-draw-emails
// Invoked by the organiser's client right after execute_draw succeeds.
// Sends every member who has saved an optional email a "names have been drawn"
// notification (no match details — just a prompt to open the group).
//
// Security model:
//  - verify_jwt = true (platform validates the caller's JWT before we run).
//  - We re-derive the caller from their JWT and require they are the group's
//    organiser AND the group is actually drawn — a member cannot trigger a blast.
//  - Emails are read with the service-role key (they are RLS/grant-hidden from
//    clients by design), never returned to the caller.
//  - If RESEND_API_KEY is not configured the function is a harmless no-op, so
//    the draw flow is never blocked while email is still being set up.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://www.checkmybasket.co.uk";
// Set EMAIL_FROM once a sending domain is verified in Resend, e.g.
// "CheckMyBasket <noreply@send.checkmybasket.co.uk>". Until then the resend.dev
// sender works but only delivers to the Resend account's own verified address.
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "CheckMyBasket <onboarding@resend.dev>";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let group_id: string | undefined;
  try {
    ({ group_id } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!group_id) return json({ error: "group_id is required" }, 400);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  // Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Not authenticated" }, 401);

  // Privileged reads with the service role.
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: group, error: groupErr } = await admin
    .from("groups").select("id, name, draw_status").eq("id", group_id).maybeSingle();
  if (groupErr) return json({ error: groupErr.message }, 500);
  if (!group) return json({ error: "Group not found" }, 404);
  if (group.draw_status !== "drawn") return json({ error: "Group is not drawn" }, 409);

  // Caller must be the organiser of this group.
  const { data: caller } = await admin
    .from("group_members").select("role")
    .eq("group_id", group_id).eq("user_id", user.id).maybeSingle();
  if (caller?.role !== "organiser") return json({ error: "Only the organiser can send draw emails" }, 403);

  // Recipients: members of this group whose profile has an email.
  const { data: members, error: memErr } = await admin
    .from("group_members")
    .select("name, profiles!inner(email)")
    .eq("group_id", group_id);
  if (memErr) return json({ error: memErr.message }, 500);

  const recipients = (members ?? [])
    .map((m) => ({
      name: m.name as string,
      // profiles!inner returns an object (or array depending on typing); handle both
      email: (Array.isArray(m.profiles) ? m.profiles[0]?.email : (m.profiles as { email?: string })?.email) ?? null,
    }))
    .filter((r): r is { name: string; email: string } => !!r.email);

  // No key configured yet -> harmless no-op so the draw is never blocked.
  if (!RESEND_API_KEY) {
    return json({ skipped: true, reason: "RESEND_API_KEY not set", eligible_recipients: recipients.length });
  }
  if (recipients.length === 0) {
    return json({ sent: 0, reason: "No members have saved an email yet" });
  }

  const groupUrl = `${APP_URL}/g/${group_id}`;
  const groupName = (group.name as string) ?? "your Secret Santa group";

  const results = await Promise.allSettled(
    recipients.map((r) => {
      const first = r.name.split(" ")[0];
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1B4332">
          <h1 style="font-size:22px">Names have been drawn! 🎅</h1>
          <p>Hi ${first}, the draw for <strong>${groupName}</strong> is done — your Secret Santa match is ready.</p>
          <p style="margin:24px 0">
            <a href="${groupUrl}" style="background:#1B4332;color:#FFF8F0;text-decoration:none;padding:12px 22px;border-radius:10px;display:inline-block;font-weight:600">Open CheckMyBasket to see your match</a>
          </p>
          <p style="color:#6E6E6E;font-size:13px">Or paste this link into your browser:<br>${groupUrl}</p>
          <hr style="border:none;border-top:1px solid #E8DDD0;margin:24px 0">
          <p style="color:#6E6E6E;font-size:12px">You're receiving this because you joined a Secret Santa group on CheckMyBasket. Unsubscribe anytime by removing your email in the group.</p>
        </div>`;
      const text =
        `Names have been drawn! 🎅\n\nHi ${first}, the draw for ${groupName} is done — your Secret Santa match is ready.\n\nOpen CheckMyBasket to see your match:\n${groupUrl}\n\n—\nYou're receiving this because you joined a Secret Santa group on CheckMyBasket. Unsubscribe anytime by removing your email in the group.`;

      return fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: r.email,
          subject: "Names have been drawn! 🎅 Open CheckMyBasket to see your match",
          html,
          text,
        }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
        return res.json();
      });
    }),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;
  return json({ sent, failed, total: recipients.length });
});
