import { createClient } from "./client";

// I1: the product's no-account promise runs on Supabase anonymous sign-ins.
// Every flow that writes data calls this first; an existing session (anonymous
// or upgraded) is reused so repeat visitors keep their identity.
export async function ensureSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    throw new Error(error?.message ?? "Could not start a session");
  }
  return data.session;
}
