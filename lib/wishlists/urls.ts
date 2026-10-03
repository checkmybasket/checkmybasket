// Shared by form validation and the server fetcher. DNS checks happen server-side.
export function webUrl(value: string): string {
  if (!value.trim()) return "";
  const url = new URL(value.trim());
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    value.length > 2048 ||
    (url.port && !["80", "443"].includes(url.port)) ||
    !host.includes(".") ||
    /(^|\.)(localhost|local|internal|home|lan|test|invalid|example)$/.test(host)
  )
    throw new Error("Enter a public http or https link.");
  return url.href;
}
