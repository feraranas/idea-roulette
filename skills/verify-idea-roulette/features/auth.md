# Email sign-in

NextAuth email (magic-link) sign-in pages: `/auth/signin`, `/auth/verify`, `/auth/signout`, `/auth/error`, backed by Prisma/Postgres and an SMTP server.

## Sub-features

- `auth-signin-page` renders the sign-in form.
- `auth-magic-link` sends a sign-in email.

## How to get to it (user POV)

- Open `/auth/signin`. The main page does not link to it.

## Driving it with appctl

Preconditions:

- Postgres with the Prisma schema applied, and a local SMTP sink (for example MailHog) in `EMAIL_SERVER_*`. appctl provides neither.

- **Page only.** Open `${URL}auth/signin` and snapshot it. Not yet scripted.

## Gotchas

- Not proved. Never point `EMAIL_SERVER_*` / `RESEND_API_KEY` at a real provider during verification: it sends real email.
