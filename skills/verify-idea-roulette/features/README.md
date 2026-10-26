# Idea Roulette verification map

This directory is the maintained source for verifying what a user can do on Idea Roulette.

## Baseline preconditions

- `appctl launch` printed `READY`, `appctl doctor` all `OK` (no OpenAI key in the server env).
- `src/data/cache.json` contains all 20 idea titles (lower-cased keys): `npm run check-cache` prints `20/20 ideas cached, 0 orphan key(s)`.
- Fresh page load at `/`.

## Driving conventions

- Use ARIA roles and names (`getByRole("button", { name: "Copy" })`), never coordinates.
- Never set `OPENAI_API_KEY` for verification unless the user explicitly approved a paid call.

## Proof and skip reporting

- Each step: full-page screenshot + ARIA snapshot of `main`; values in `result.json`.
- Side effects: tRPC responses, non-local requests, `cache.json` hash before/after.

## Features

- [Spin for an idea](./spin.md)
- [Idea details and one pager](./idea-details.md)
- [Generate AI task list](./generate-tasklist.md)
- [Copy, regenerate and reset](./copy-regenerate-reset.md)
- [Email sign-in](./auth.md)
