import { deliver, emailPayload, type DeliveryStore } from "./delivery.ts";

interface Group { id: string; name: string; draw_status: string; organiser_id: string }
interface Recipient { drawId: string; name: string; email: string }
export interface Dependencies {
  authenticate(header: string): Promise<string | null>;
  group(id: string): Promise<Group | null>;
  isOrganiserMember(groupId: string, userId: string): Promise<boolean>;
  recipients(groupId: string): Promise<Recipient[]>;
  store: DeliveryStore;
  apiKey?: string;
  appUrl: string;
  from: string;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
export async function handleRequest(req: Request, deps: Dependencies): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const user = await deps.authenticate(req.headers.get("Authorization") ?? "");
    if (!user) return json({ error: "Not authenticated" }, 401);
    if (Number(req.headers.get("content-length") ?? 0) > 4096)
      return json({ error: "Request too large" }, 413);
    const raw = await req.text();
    if (raw.length > 4096) return json({ error: "Request too large" }, 413);
    let id: unknown;
    try { id = JSON.parse(raw)?.group_id; } catch { return json({ error: "Invalid JSON body" }, 400); }
    if (typeof id !== "string" || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
      return json({ error: "Valid group_id required" }, 400);
    const group = await deps.group(id);
    if (!group || group.organiser_id !== user || !await deps.isOrganiserMember(id, user))
      return json({ error: "Only the organiser can send draw emails" }, 403);
    if (group.draw_status !== "drawn") return json({ error: "Group is not drawn" }, 409);
    if (!deps.apiKey) return json({ skipped: true, reason: "Email sending not configured" });
    const recipients = await deps.recipients(id);
    const counts = { sent: 0, failed: 0, skipped: 0, total: recipients.length };
    for (const recipient of recipients) {
      try {
        const outcome = await deliver(recipient.drawId,
          emailPayload(deps.from, deps.appUrl, id, group.name, recipient.name, recipient.email),
          deps.apiKey, deps.store, deps.fetcher, deps.sleep);
        counts[outcome]++;
      } catch { counts.failed++; }
    }
    return json(counts);
  } catch {
    return json({ error: "Email notification unavailable" }, 503);
  }
}
