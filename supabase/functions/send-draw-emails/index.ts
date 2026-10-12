import { createClient } from "jsr:@supabase/supabase-js@2.107.0";
import { handleRequest } from "./handler.ts";
import type { Claim } from "./delivery.ts";

// Keep platform verify_jwt=true AND validate the caller against Auth.
// Privileged data/RPCs stay server-only; responses contain aggregate counts.
Deno.serve(async (req) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return handleRequest(req, {
    appUrl: Deno.env.get("APP_URL") ?? "https://www.checkmybasket.co.uk",
    from: Deno.env.get("EMAIL_FROM") ?? "CheckMyBasket <onboarding@resend.dev>",
    apiKey: Deno.env.get("RESEND_API_KEY"),
    authenticate: async (header) => {
      const client = createClient(url, anonKey, {
        global: { headers: { Authorization: header } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.getUser();
      return error ? null : data.user?.id ?? null;
    },
    group: async (id) => {
      const { data, error } = await admin.from("groups")
        .select("id,name,draw_status,organiser_id").eq("id", id).maybeSingle();
      if (error) throw new Error("Group unavailable");
      return data;
    },
    isOrganiserMember: async (groupId, userId) => {
      const { data, error } = await admin.from("group_members").select("role")
        .eq("group_id", groupId).eq("user_id", userId).maybeSingle();
      if (error) throw new Error("Membership unavailable");
      return data?.role === "organiser";
    },
    recipients: async (groupId) => {
      const { data: draws, error: drawError } = await admin.from("draws")
        .select("id,giver_id").eq("group_id", groupId);
      const { data: members, error } = await admin.from("group_members")
        .select("user_id,name,profiles!inner(email)").eq("group_id", groupId);
      if (error || drawError) throw new Error("Recipients unavailable");
      return (members ?? []).flatMap(member => {
        const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
        const email = (profile as { email?: string | null })?.email;
        const draw = draws?.find(d => d.giver_id === member.user_id);
        return email && draw ? [{ drawId: draw.id, name: member.name, email }] : [];
      });
    },
    store: {
      claim: async (drawId, hash, email) => {
        const { data, error } = await admin.rpc("claim_draw_email", {
          p_draw_id: drawId, p_payload_hash: hash, p_email: email,
        });
        if (error) throw new Error("Delivery guard unavailable");
        return data as Claim;
      },
      finish: async (id, lease, result) => {
        const { data, error } = await admin.rpc("finish_draw_email", {
          p_id: id, p_lease: lease, p_result: result,
        });
        if (error) throw new Error("Delivery acknowledgement unavailable");
        return data === true;
      },
    },
  });
});
