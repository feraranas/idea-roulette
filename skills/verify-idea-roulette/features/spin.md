# Spin for an idea

The main button runs a slot-machine animation over the idea titles and lands on one random idea.

## Sub-features

- `spin-start` button `Pick a Random Startup Idea` becomes a disabled `Spinning...` button.
- `spin-land` after about 3 s (`?fast=1`: 1.5 s; reduced motion: at most 0.8 s) the idea view and `Create AI Agent Tasklist` appear.
- `spin-prefetch` landing fires `tasklist.ensure` in the background.

## How to get to it (user POV)

- Open `/` and click `Pick a Random Startup Idea`.

## Driving it with appctl

Preconditions:

- Baseline.

- **Spin.** `appctl journey spin-to-tasklist` steps 1–2. `result.json` `spin.spinMs` ≈ 3500 and `chosenTitle` is one of `ideas.json` titles; `02-spinning.png` shows the slot list.
- **Prefetch.** `result.json` `trpc` includes `/api/trpc/tasklist.ensure?batch=1` → 200.

## Gotchas

- The idea is random. Assert membership in `ideas.json`, not a specific title.
- `agent-helpers/uat.md` says 5–10 s with 6.5 s default; the page passes 3000 ms. Report the observed time.
- The reduced-motion path is mapped but not proved (use `browser.newContext({ reducedMotion: "reduce" })`).
