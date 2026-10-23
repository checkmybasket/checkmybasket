# Remaining owner checks before release

Use the running isolated app at http://localhost:3101. Keep disposable staging data; do not use production identities or real email addresses for these checks. Record browser/device, date, result and any screenshot in the audit report.

- [ ] Native 200% browser zoom: check home, create, gifts, Return, owner/shared wishlist, group tabs and settings. Confirm readable content, reachable actions and no page-level horizontal scroll. The recorded 640px reflow proxy is not proof of native zoom.
- [ ] Screen reader: use VoiceOver or your normal screen reader. Confirm one page title heading, sensible heading nesting, labelled inputs, selected group/category controls, announcement of validation/loading/errors, and usable dialogs. AX/DOM inspection alone does not complete this check.
- [ ] Physical phone: check portrait and short landscape with the device keyboard open. Confirm fixed create/group actions do not hide inputs, focus or validation messages; check touch targets and shared wishlist expand/collapse.
- [ ] Clipboard denial: deny clipboard access through the browser's normal site-permission controls, then try Copy invite/share. Confirm manual-copy guidance and selectable link, without a stranded loading state.
- [ ] Protected preview: confirm authentication remains enabled and responses are noindex. A functional cloud preview needs an isolated cloud-accessible backend; local loopback Supabase cannot serve Vercel. Do not tunnel this local stack or reuse production backend credentials for a test preview.
- [ ] Real email/provider/account checks: verify domain/mailbox ownership and provider delivery through the normal owner account workflow. Local Mailpit proves the application flow, not external delivery.

## Reviewed release

The production branch has not been changed by this audit. Review and release the application changes and SECURITY 03–05 migrations through the normal production process. Never upload the local staging `.next` artifact: rebuild with intended production environment values.

After release, recheck the production commit, migrations, private member/nonmember boundaries, preview noindex/protection, 39 public canonicals/sitemap entries, OG tags/images and production-mode Lighthouse. Read-only live evidence currently shows 24 pages missing OG image tags that are already present in the local branch. Keep local staging noindex regardless of Lighthouse SEO score.

Known upstream development-tool advisories remain SECURITY 02; the production dependency audit was clean in the prior report. Do not force incompatible dependency changes just to suppress the development-tool advisory chain.
