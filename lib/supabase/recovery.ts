import { createClient } from "@/lib/supabase/client";

export type RecoveryReply = {
  message?: string;
  verified_email?: string | null;
  access_token?: string;
  refresh_token?: string;
  group_id?: string | null;
};

export async function recoveryRequest(body: {
  action: "setup" | "status" | "request" | "redeem";
  email?: string;
  group_id?: string;
  wishlist?: boolean;
  token?: string;
}): Promise<RecoveryReply> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/group-recovery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || "Could not complete that request. Please try again.",
    );
  return data;
}
