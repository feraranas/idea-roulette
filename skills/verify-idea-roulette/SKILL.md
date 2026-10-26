---
name: verify-idea-roulette
description: Launch Idea Roulette (Next.js 15 + tRPC "AI Task-List Creator") on its own port with no OpenAI key, and drive it in headless Chrome to prove spin → chosen idea → cached AI task list → Copy. Use when you must show the real one-page flow works, without spending OpenAI quota or sending email.
---

# Verify idea-roulette

The user surface is one page, `/` (`src/app/page.tsx`): a "Pick a Random Startup Idea" button spins a slot machine over the 20 ideas in `src/data/ideas.json`, shows the chosen idea (`IdeaDetails`, with a "View one pager" toggle), then "Create AI Agent Tasklist" calls tRPC `tasklist.ensure` / `tasklist.generate`. Those return the markdown from `src/data/cache.json` when the idea is cached (all 20 are) and otherwise call OpenAI and write the cache file. Secondary surfaces: NextAuth email sign-in pages under `/auth/*` (the `/auth/signin` page is rendered; submitting needs Postgres + SMTP), `/api/upload`, `/api/transcribe`, Inngest and Storybook. Beyond the sign-in page render they are mapped but not driven.

All driving goes through `scripts/appctl`, which resolves its own real path (works from `skills/`, `.cursor/skills/` or `.claude/skills/`).

## Launch

```bash
export RUN_ID=$(date +%s)        # state in /tmp/verify-idea-roulette-$RUN_ID
export APP_PORT=13300            # change for a second instance
skills/verify-idea-roulette/scripts/appctl launch
```

- If `node_modules/next` is missing: `npm install`, then `git checkout -- package-lock.json` (guards against npm rewriting the lockfile). Since the lockfile sync (PR #2) `npm ci` also works (`npm ci --dry-run` passes). It also runs `npx prisma generate` if `node_modules/.prisma/client` is missing.
- Offline pre-checks, no API calls: `npm run check-cache` (expects `20/20 ideas cached, 0 orphan key(s)`) and `npm test` (cache behavior tests).
- Installs `playwright-core` into `$STATE/tools`, outside the repo.
- Starts `npx next dev --turbopack -H 127.0.0.1 -p $APP_PORT` in its own process group with: no `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GROQ_API_KEY` / `RESEND_API_KEY`, `NEXT_TELEMETRY_DISABLED=1`, a throwaway `NEXTAUTH_SECRET`, and a `DATABASE_URL` pointing at an unreachable port. No `.env` is needed. If the repo has a `.env`, Next loads it, but the explicit env above wins for these keys. Check `doctor`.
- Ready = `READY url=...`, printed once `/` serves `Pick a Random Startup Idea`; `launch` then exits, also when its output is piped (for example `| tail`). It refuses to start if the port is in use.

## Doctor

```bash
skills/verify-idea-roulette/scripts/appctl doctor
```

Read-only. All `OK`: our next pid alive; `/` renders `AI Task-List Creator` and the spin button; the server process env has no `OPENAI_API_KEY`; `/api/trpc/tasklist.ensure` answers (405 to GET = mounted); Chrome found; playwright-core installed.

## Drive

Two journeys, run serially against the one long-lived instance (doctor between them).

`appctl journey spin-to-tasklist` runs `scripts/browser.mjs` (headless Chrome 1280×900, clipboard permission granted) using ARIA roles and names:

1. heading `AI Task-List Creator`, then click button `Pick a Random Startup Idea`, then button `Spinning...` appears.
2. Wait for button `Create AI Agent Tasklist` (spin is about 3 s; `?fast=1` makes it 1.5 s but is not the default user path). Read the chosen idea from the second `h1`.
3. Click `View one pager`, then `Hide one pager` appears.
4. Click `Create AI Agent Tasklist`, then heading `AI Agent Tasklist` and button `Generate again` appear. The panel text must contain the first line of `cache.json[title.toLowerCase()]`.
5. Click `Copy`. The clipboard must equal the cached markdown exactly.

`appctl journey panel-actions` covers the rest of the page, same browser setup:

1. Spin, `View one pager` then `Hide one pager` (`aria-expanded=false` again).
2. Create the task list, click `Regenerate`, then `Generate again`: each is one more `tasklist.generate` 200 with identical panel text.
3. `Pick another idea` returns to idle (only the page `h1`, no task list).
4. Fresh context with `reducedMotion: "reduce"`: spin lands in under 2 s (source caps it at 0.8 s).
5. Error path on the real server: the `tasklist.generate` request body is rewritten in the browser to an uncached title, so the keyless server returns 500 (`OPENAI_API_KEY is not set`) and writes nothing. Card `Something went wrong` appears; `Retry generation` sends one more generate; `Pick new idea` returns to idle. It also records `primaryLabelInError` and `primaryClickInErrorRanGenerate` (see the product-gap note in `features/generate-tasklist.md`).
6. `/auth/signin` renders heading `Welcome` and the `Email address` field. The form is never submitted.

Recipes for every feature: [features/README.md](features/README.md).

## Evidence

`skills/verify-idea-roulette/evidence/$RUN_ID/<journey>/` (override with `APP_VERIFY_EVIDENCE`). `spin-to-tasklist/`: `NN-step.png` (full page) + `NN-step.aria.txt` for idle, spinning, chosen, tasklist-ready and copied; `result.json` (spin time, chosen title, panel/cache match, clipboard match, every tRPC response, every non-local request, console errors); `cache-json-sha256.txt` (before launch and after the journey; must be equal); `server-log-excerpt.txt` (tRPC lines from `next dev`). `panel-actions/`: `10-regenerated`, `11-reset`, `12-error`, `13-signin` (`.png` + `.aria.txt`), plus `result.json` (`checks` all true), `cache-json-sha256.txt` and `server-log-excerpt.txt`.

Proof standards: real clicks on the real page; tRPC is called by the UI, never directly. The OpenAI boundary is removed, not mocked: with no key, any uncached generate throws `OPENAI_API_KEY is not set`. A successful generate therefore proves the cache path, and the unchanged `cache.json` hash proves no write. The only external requests allowed are Google Fonts CSS/fonts (read-only). The error path is proved by rewriting the request title in the browser, not by editing `cache.json`. Live generation (success on an uncached idea) and sending a sign-in email stay unverified. Committed reference proof: `evidence/final/`.

## Cleanup

```bash
skills/verify-idea-roulette/scripts/appctl cleanup
```

Kills only the process group whose leader pid is in `$STATE/next.pid`, warns if the port is still open, and removes `$STATE`. It leaves `node_modules` and `.next/` (both gitignored) for faster relaunch. Evidence is kept.

## Helpers

- `scripts/appctl launch | doctor | journey spin-to-tasklist | journey panel-actions | cleanup` (env `RUN_ID`, `APP_PORT`, `CHROME_PATH`).
- `scripts/browser.mjs spin-to-tasklist | panel-actions`: called by `appctl journey`.

## Maintenance

Use `/maintain-verification-skill` to keep `features/` in step with the app.
