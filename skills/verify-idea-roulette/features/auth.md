# Email sign-in

NextAuth email (magic-link) sign-in pages: `/auth/signin`, `/auth/verify`, `/auth/signout`, `/auth/error`, backed by Prisma/Postgres and an SMTP server.

## Sub-features

- `auth-signin-page` renders the sign-in form.
- `auth-magic-link` sends a sign-in email.

## How to get to it (user POV)

- Open `/auth/signin`. The main page does not link to it.

## Driving it with appctl

Preconditions:

- Page render: baseline only.
- Magic link: Postgres with the Prisma schema applied, and a local SMTP sink (for example MailHog) in `EMAIL_SERVER_*`. appctl provides neither, so `auth-magic-link` is unverified.

- **Page only.** `appctl journey panel-actions` step 6: `/auth/signin` renders heading `Welcome` and the `Email address` field (`13-signin.png`, `checks.signinPage`). It works with appctl's unreachable `DATABASE_URL`. The form is not submitted.

## Gotchas

- Sending is not proved. Never point `EMAIL_SERVER_*` / `RESEND_API_KEY` at a real provider during verification: it sends real email.
