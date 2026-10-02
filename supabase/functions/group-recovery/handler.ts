import { createClient } from "jsr:@supabase/supabase-js@2.107.0";

const APP_URL = "https://www.checkmybasket.co.uk";
const URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const publicClient = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
const generic = { message: "If recovery is enabled for that email, a sign-in link is on its way. Check your inbox and spam folder." };
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hash(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
async function allowed(key: string, limit: number) {
  const { data, error } = await admin.rpc("recovery_rate_limit", { p_key: await hash(key), p_limit: limit });
  if (error) throw new Error("Rate limit unavailable");
  return data === true;
}
async function sendLink(userId: string, email: string, purpose: "setup" | "login", groupId: string | null) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) throw new Error("Email delivery unavailable");
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  const tokenHash = await hash(token);
  const { error } = await admin.from("recovery_tokens").insert({ token_hash: tokenHash, user_id: userId, email, purpose, group_id: groupId });
  if (error) throw new Error("Could not create link");
  // The secret stays in a URL fragment, outside HTTP request logs and referrers.
  // The website requires a deliberate button press before redemption.
  const link = `${APP_URL}/return#token=${token}`;
  const title = purpose === "setup" ? "Verify your email to save access to your group" : "Your CheckMyBasket sign-in link";
  const explanation = purpose === "setup"
    ? "Confirm this email to reopen your existing groups on another device."
    : "Use this link to reopen your existing CheckMyBasket groups.";
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: email, subject: title,
        html: `<div style="font-family:system-ui;max-width:480px;margin:auto;color:#1B4332"><h1>${title}</h1><p>${explanation}</p><p><a href="${link}">Continue to CheckMyBasket</a></p><p>This private link expires in 15 minutes and works once. Do not forward it: it grants access to your groups and private matches.</p><p>If you did not request this, ignore this email.</p></div>`,
        text: `${title}\n\n${explanation}\n\n${link}\n\nThis private link expires in 15 minutes and works once. Do not forward it: it grants access to your groups and private matches. If you did not request this, ignore this email.`,
      }),
    });
    if (!result.ok) throw new Error("Email provider rejected delivery");
  } catch (error) {
    await admin.from("recovery_tokens").delete().eq("token_hash", tokenHash);
    throw error;
  }
}

export async function handleRequest(req: Request) {
  const origin = req.headers.get("origin");
  const cors: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin",
  };
  if (origin === APP_URL || origin === "http://localhost:3101") cors["Access-Control-Allow-Origin"] = origin;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
  if (origin && !cors["Access-Control-Allow-Origin"]) return json({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return json({ error: "Request too large" }, 413);
  let body: { action?: string; email?: string; group_id?: string; token?: string };
  try {
    const text = await req.text();
    if (text.length > 4096) return json({ error: "Request too large" }, 413);
    body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch { return json({ error: "Invalid request" }, 400); }
  try {
    if (body.action === "redeem") {
      if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return json({ error: "This link is invalid or has expired. Request a new one." }, 400);
      const { data: rows, error } = await admin.rpc("consume_recovery_token", { p_hash: await hash(body.token) });
      if (error) throw new Error("Token verification unavailable");
      const token = rows?.[0];
      if (!token) return json({ error: "This link is invalid, expired or already used. Request a new one." }, 400);
      const { data: { user }, error: userError } = await admin.auth.admin.getUserById(token.user_id);
      if (userError || !user) return json({ error: "This group access is no longer available." }, 400);
      if (token.purpose === "setup") {
        // Never change an existing verified identity or merge different members.
        if (user.email && user.email.toLowerCase() !== token.email) return json({ error: "This member already has a different sign-in email. Use that address." }, 409);
        const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(user.id, { email: token.email, email_confirm: true });
        if (updateError || updated.user?.id !== user.id) {
          await admin.from("recovery_identities").delete().eq("user_id", user.id).eq("email", token.email).eq("auth_ready", false);
          return json({ error: "That email cannot be linked to this member. It may already be used by another member. Return to your original browser and use a different email." }, 409);
        }
        const { error: savedError } = await admin.from("recovery_identities").upsert({ user_id: user.id, email: token.email, auth_ready: true, verified_at: new Date().toISOString() }, { onConflict: "user_id" });
        if (savedError) throw new Error("Could not save verified email");
      } else if (user.email?.toLowerCase() !== token.email || !user.email_confirmed_at) {
        return json({ error: "This sign-in email has changed. Request a new link." }, 400);
      }
      // Mint a Supabase session only after proving possession of our emailed token.
      const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email: token.email });
      if (linkError || link.user?.id !== token.user_id) throw new Error("Could not restore the original member");
      const { data: login, error: loginError } = await publicClient().auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
      if (loginError || !login.session || login.user?.id !== token.user_id) throw new Error("Could not restore session");
      return json({ access_token: login.session.access_token, refresh_token: login.session.refresh_token,
        group_id: token.group_id, verified: token.purpose === "setup" });
    }
    if (body.action === "request") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (email.length > 254 || !emailPattern.test(email)) return json({ error: "Please enter a valid email address." }, 400);
      // Rate-limit every address, including unknown ones, before lookup.
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const ipAllowed = await allowed(`ip:${ip}`, 30);
      const emailAllowed = await allowed(`email:${email}`, 3);
      if (!ipAllowed || !emailAllowed) return json(generic);
      const { data: identity, error } = await admin.from("recovery_identities").select("user_id,email").eq("email", email).eq("auth_ready", true).maybeSingle();
      if (error) throw new Error("Recovery lookup unavailable");
      if (!identity) return json(generic);
      const requestedGroup = typeof body.group_id === "string" && uuidPattern.test(body.group_id) ? body.group_id : null;
      const { data: membership, error: memberError } = await admin.from("group_members").select("group_id").eq("user_id", identity.user_id).order("joined_at", { ascending: false }).limit(1);
      if (memberError) throw new Error("Membership lookup unavailable");
      if (!membership?.length) return json(generic);
      let groupId = membership[0].group_id;
      if (requestedGroup) {
        const { data: match } = await admin.from("group_members").select("group_id").eq("user_id", identity.user_id).eq("group_id", requestedGroup).maybeSingle();
        if (match) groupId = match.group_id;
      }
      try { await sendLink(identity.user_id, email, "login", groupId); } catch { /* Keep the response identical for registered and unknown emails. */ }
      return json(generic);
    }
    if (body.action === "setup" || body.action === "status") {
      const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
      const { data: { user }, error: authError } = await publicClient().auth.getUser(bearer);
      if (authError || !user) return json({ error: "Open your group in the browser where you joined first." }, 401);
      const { data: identity, error: identityError } = await admin.from("recovery_identities").select("email").eq("user_id", user.id).eq("auth_ready", true).maybeSingle();
      if (identityError) throw new Error("Recovery status unavailable");
      if (body.action === "status") return json({ verified_email: identity?.email ?? null });
      if (identity) return json({ verified_email: identity.email, message: "Email recovery is already enabled." });
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const groupId = typeof body.group_id === "string" && uuidPattern.test(body.group_id) ? body.group_id : null;
      if (email.length > 254 || !emailPattern.test(email) || !groupId) return json({ error: "Enter a valid email and open your existing group." }, 400);
      const { data: member, error: memberError } = await admin.from("group_members").select("group_id").eq("group_id", groupId).eq("user_id", user.id).maybeSingle();
      if (memberError) throw new Error("Membership lookup unavailable");
      if (!member) return json({ error: "You must be a member of this group." }, 403);
      if (user.email && user.email.toLowerCase() !== email) return json({ error: "Use the email already linked to this member." }, 409);
      if (!await allowed(`setup:${user.id}`, 3) || !await allowed(`email:${email}`, 3)) return json({ error: "Too many requests. Try again in 10 minutes." }, 429);
      await sendLink(user.id, email, "setup", groupId);
      return json({ message: "Check your email to verify it and save access to your group. The link expires in 15 minutes." });
    }
    return json({ error: "Unknown action" }, 400);
  } catch {
    // Do not log credentials, addresses, tokens or provider response bodies.
    return json({ error: "We couldn't complete that request. Please try again shortly." }, 503);
  }
}
