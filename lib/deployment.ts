/** Vercel supplies VERCEL_ENV for production, preview and development deploys. */
export function shouldPreventIndexing(environment = process.env.VERCEL_ENV): boolean {
  return environment !== undefined && environment !== "production";
}
