import { createClient } from "@/lib/supabase/server";
import { extractMetadata, safeFetch } from "@/lib/wishlists/safe-fetch";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Please reopen your wishlist." },
      { status: 401 },
    );
  const { data: allowed, error } = await supabase.rpc(
    "personal_wishlist_metadata_allowed",
  );
  if (error || !allowed)
    return Response.json(
      {
        message:
          "Add the details yourself; automatic previews are temporarily unavailable.",
      },
      { status: 429 },
    );
  try {
    const text = await request.text();
    if (text.length > 4096) throw new Error("Too large");
    const { url } = JSON.parse(text);
    if (typeof url !== "string") throw new Error("Missing URL");
    const fetched = await safeFetch(url, "html");
    return Response.json(
      extractMetadata(fetched.body.toString("utf8"), fetched.url),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        message:
          "We could not fetch details from this shop. Your link is ready; add a title below.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
