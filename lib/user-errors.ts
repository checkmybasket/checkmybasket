/** Do not expose arbitrary backend messages, details, SQL or stack traces. */
export function userError(error: unknown, action: string): string {
  const value = error && typeof error === "object" ? error as { code?: string; message?: string } : {};
  const message = typeof value.message === "string" ? value.message : "";
  if (/need at least 3|at least three members/i.test(message)) return "Invite at least three people before drawing names.";
  if (/valid draw|exclusion rules/i.test(message)) return "These exclusions prevent a valid draw. Review the exclusions and try again.";
  if (/organisers must delete/i.test(message)) return "As the organiser, use Delete group in settings instead of leaving.";
  if (/only the organiser|organiser only/i.test(message)) return "Only the organiser can do this. Ask your organiser to make this change.";
  if (/rate limit|too many|please wait|allowance/i.test(message)) return "Please wait before trying this action again.";
  if (/invalid email/i.test(message)) return "Check the email address and try again, or leave it blank to continue without email.";
  if (value.code === "42501" || value.code === "PGRST301" || /not authenticated|sign-in required|authentication required|jwt expired/i.test(message)) {
    return "Your session may have expired or you may not have access. Reopen your group or use Return & sign in to recover access.";
  }
  if (value.code === "23505") return "This has already been added. Refresh the page to see the latest changes.";
  return `Could not ${action}. Check your connection and try again.`;
}
