# Authentication provider decision — 23 October 2026

The owner chose to retain anonymous/passwordless access and not introduce password login. Source inspection confirms anonymous sign-in in lib/supabase/auth.ts and OTP verification in supabase/functions/group-recovery/handler.ts. No app/lib/functions password-login or password-signup calls were found.

Authenticated dashboard inspection of production project nejkvrzabdetsnhpeqtl confirmed:

- Allow anonymous sign-ins: enabled.
- Email provider: enabled, required for the existing OTP recovery flow.
- Confirm email and secure email change: enabled.
- Email OTP expiry: 3600 seconds; OTP length: 8 digits.
- Prevent use of leaked passwords: off; dashboard explicitly limits it to Pro and above. The organisation is on Free.
- The Email panel exposes a combined email signup/login provider, without a separate password-login disable control.

No hosted settings, credentials, records or billing plan were changed. No emails were sent. Disabling Email would also disable the app's recovery mechanism, so it was preserved.

SECURITY 06 is resolved as a documented product decision and account-setting verification: password authentication is unsupported in the application UI, and the paid leaked-password option is not enabled for this passwordless product. This is not a claim that the underlying Supabase password endpoints are disabled, nor that the leaked-password advisor warning has disappeared. Enforcing a backend-wide password prohibition would require separate design and verification; it was not introduced as a hidden product change. If password accounts are introduced later, reassess password controls and the required plan before release.

The existing local recovery/email regression evidence remains valid because this task changed documentation only. Prior build, lint, TypeScript and 110 regressions passed; no unnecessary rebuild or production mutation was performed for this decision record.
