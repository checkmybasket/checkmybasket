import { safeFetch } from "@/lib/wishlists/safe-fetch";
import { createClient } from "@/lib/supabase/server";
import { uuidPattern } from "@/lib/wishlists/types";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const item = query.get("item");
    const token = query.get("token");
    if (!item || !uuidPattern.test(item) || (token && !uuidPattern.test(token)))
      throw new Error("Not available");
    const supabase = await createClient();
    const { data: url, error } = await supabase.rpc("personal_wish_image", {
      p_item: item,
      p_token: token,
    });
    if (error || !url) throw new Error("Not available");
    const fetched = await safeFetch(url, "image");
    return new Response(new Uint8Array(fetched.body), {
      headers: {
        "Content-Type": fetched.type,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
