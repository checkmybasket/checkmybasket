# Year-round wishlist maintenance

Owners explicitly review a list; buyers see the review date. Editing list details or any wish clears that confirmation. Visits, reservations and purchases never mark a list reviewed. Sharing tokens are preserved.

Received and archived gifts are hidden from the shared list and its image endpoint. Archiving/restoring preserves reservations. A separate confirmation adds a received wish back and clears its old reservation. Repeatable wishes are labelled “Happy to receive again”; nothing is automatically marked received or released.

## Reminder delivery

Each list starts opted out, independently of email recovery. Enabling reminders requires an occasion date and a recovery identity whose verified address matches the Auth user. Owners can choose annual month/day repeats; Feb 29 becomes Feb 28 in other years. Candidate dates use Europe/London calendar days. One message is due 21 days before and one 3 days after, with six days of catch-up. Before reminders are never sent on/after the event.

Supabase Cron checks hourly from 09:00–19:00 UTC (09:00–19:00 GMT / 10:00–20:00 BST). The worker uses a random, scoped token generated within Postgres and stored encrypted in Vault; only its hash is used to authenticate the request. Platform JWT verification is disabled only for this endpoint because it implements its own authentication. No other function setting changed.

Jobs are unique per wishlist/event date/message type. Claims use row locks and SKIP LOCKED. Retries reuse a Resend idempotency key, have a 10-minute lease, three-attempt limit and 23-hour retry window. The worker rechecks opt-in, date and verified address before each send. No reservation table is consulted. Provider and acknowledgement failures retry with the same key. Jobs are retained until 90 days after their occasion. Deleting a list cascades its preferences/jobs.

The email unsubscribe link carries an opt-out-only token in a fragment. The noindex settings page clears the fragment and requires a deliberate button press, so email scanners cannot unsubscribe via GET. Unsubscribing never changes sign-in access or the list.

## Verification and operations

- `node --env-file=.env.staging.local tests/wishlist-review-live.cjs`
- `node --env-file=.env.staging.local tests/wishlist-lifecycle-live.cjs`
- Run `tests/wishlist-reminders-db.sql` via local psql; it rolls back all fixtures.
- `node --env-file=.env.staging.local tests/wishlist-reminders-mail-live.cjs` requires the dedicated local Docker socket and captured mail only.
- `deno test supabase/functions/wishlist-reminders/handler_test.ts`
- `deno check supabase/functions/wishlist-reminders/index.ts`
- Build, lint and standalone TypeScript pass. Real-browser review/lifecycle/verified reminder/opt-out flows and eight responsive widths passed locally.

Production migrations match the checked-in timestamp versions. The Edge worker is deployed and authenticated dispatch returned `{sent:0,failed:0,cancelled:0}`; no real user has been automatically opted in and no production test email was sent. Existing email provider configuration is reused.

Website PR #15 is live at commit `462d09545ae9640fe451b1a211ba972685d4a703`, deployment `dpl_8UDDdfhEvtH9q9jtkywKWNc8NuCV`. Live private-list creation, review, archive/restore, default-off reminders, mobile layout, unsubscribe noindex and zero console/page errors passed. All disposable production lists were removed. No real email was requested or sent. The scoped scheduler returned 200 after deployment; unauthenticated callers receive 401.

Monitor `cron.job_run_details`, `net._http_response` for the scheduler's aggregate result, and reminder_jobs for failed/expired jobs (administrators only). Cron SQL succeeding means a request was queued, not that delivery succeeded. Investigate non-200 worker responses and failed jobs; never dump email addresses, Vault values or request headers into logs.

The security advisor's private-schema RLS-without-policies and bounded RPC findings are expected: tables are deny-by-default and RPCs enforce owner/link possession. WISH 04 records the separate Supabase-managed pg_net namespace/grant follow-up. The Data API must not expose net, personal_wishlist or vault. Worker/preference RPC privileges were checked independently.
