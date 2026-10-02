# Email access recovery

Published 2 October 2026. Optional verification preserves the original Supabase user ID, so memberships, organiser permissions, wishes and private draw assignments remain unchanged.

## Member experience

- Choose **Save access to your group** after creating a draw, on the group Draw tab, or after revealing a match.
- Enter a sign-in email and open the verification email. Press **Continue to my group** to confirm ownership and sign in.
- On another device, use `/return` and request a fresh link for that verified email.
- Draw notifications link to `/return?group=<group-id>`. Existing signed-in members go to their group; otherwise they can request recovery.
- A notification email alone is not verified and cannot restore access. Recovery must be enabled while the original member session is still available.
- Notification preferences and the verified sign-in email are separate. Changing/removing notifications does not change the sign-in identity.
- Different member identities are never merged. If an email belongs to another member, use a different email for setup. Changing/deleting a verified sign-in identity currently needs support.

## Security and implementation

`group-recovery` implements custom authentication: setup/status validate a Supabase user token; redemption validates a 256-bit emailed secret. Public link requests use a generic response for unknown, registered and rate-limited addresses. The gateway JWT check is therefore disabled for this function; it remains enabled for `send-draw-emails`.

Tokens are hashed in the database, expire after 15 minutes, and are consumed transactionally. They are sent in URL fragments and removed from the address bar. Redemption requires a button press to avoid email scanners consuming a link. Responses containing sessions use `Cache-Control: no-store`. Expired tokens and old hashed rate-limit counters are removed as further recovery requests run.

The recovery tables have RLS enabled and no client grants or policies. The two recovery RPCs are SECURITY INVOKER and service-role-only. Setup reserves the verified address transactionally before linking the original Auth user; different simultaneous setup emails cannot overwrite each other. Only after emailed proof is redeemed does the function confirm the Auth email and mint a session. Both generated-link and session user IDs must match the original token owner.

The service uses the existing project-level `RESEND_API_KEY` and `EMAIL_FROM`. These are never stored in source or sent to the browser. The return URL is fixed to `https://www.checkmybasket.co.uk`, so callers cannot redirect credentials elsewhere.

## Verification

Run the isolated mail-provider regression tests:

```sh
npx deno test --node-modules-dir=none --allow-env supabase/functions/group-recovery/handler_test.ts
```

Six tests cover hashed-token storage, link content, failed delivery cleanup, unauthenticated/nonmember setup, request rate limits, malformed tokens, and identical registered/unknown/provider-failure responses. No actual emails are sent by these tests.

Live integration verification used four temporary anonymous users and a drawn three-member group. Fresh sessions restored the original member ID, group and wishlist; each member could read only their own draw. Replay, concurrent consumption, expiry, nonmembership, changed-email tokens, and client access to credential tables/RPCs were checked. Sessions were revoked and test users/group removed afterward.

Website production build, TypeScript, targeted lint and Deno checks passed. Browser visual/interactive verification was unavailable because the desktop browser security-policy check could not be completed. Inbox receipt of the new verification/recovery email was not manually checked; provider generation/delivery handling was tested with a mock. Existing draw-email delivery was already confirmed before this feature.
