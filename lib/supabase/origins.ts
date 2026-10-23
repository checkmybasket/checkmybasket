/** Allow only the configured backend in CSP, including its Realtime endpoint. */
export function supabaseConnectSources(value: string): string {
  const url = new URL(value);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))) {
    throw new Error("Supabase must use HTTPS, or HTTP on a local loopback host.");
  }
  const websocket = new URL(url.origin);
  websocket.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${url.origin} ${websocket.origin}`;
}
