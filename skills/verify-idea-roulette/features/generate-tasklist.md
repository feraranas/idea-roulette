# Generate AI task list

`Create AI Agent Tasklist` returns a markdown checklist for the chosen idea: from `src/data/cache.json` when cached, otherwise from OpenAI (`OPENAI_MODEL`, default `gpt-5`), which is then written to the cache.

## Sub-features

- `gen-cached` cached idea: panel `AI Agent Tasklist` renders the cached markdown; the button becomes `Generate again`.
- `gen-live` uncached idea: OpenAI call + cache write.
- `gen-error` failure: card `Something went wrong` with `Retry generation` and `Pick new idea`.

## How to get to it (user POV)

- After a spin, click `Create AI Agent Tasklist`.

## Driving it with appctl

Preconditions:

- Baseline; the chosen idea is in `cache.json` (all 20 are).

- **Generate (cached).** Journey step 4. Observed in `evidence/final`: `tasklist.generate` → 200, `panelContainsFirstCachedLine: true` (`Prototype overview`), about 11.7k chars rendered, `cache.json` sha256 unchanged.
- **Error path.** `appctl journey panel-actions` step 5: the browser rewrites the `tasklist.generate` body to the uncached title `Verify Uncached Idea Do Not Generate`. The keyless server answers 500 (`OpenAI API key is not configured...` in the console) and card `Something went wrong` appears. `Retry generation` sends one more generate (still 500). `Pick new idea` returns to idle. `cache.json` sha256 is unchanged. Never edit the committed `cache.json` to force this.

## Gotchas

- Product gap (reported, not fixed here): in the error state the primary button reads `Pick a Random Startup Idea`, but clicking it re-runs generate (`src/app/page.tsx`: `onClick={state === "idle" ? handleSpin : handleGenerate}`, and the label falls through to the idle text). `result.json` records `primaryLabelInError` and `primaryClickInErrorRanGenerate: true`.
- `gen-live` is unverified: it is a paid OpenAI call and writes `src/data/cache.json` in the repo.
- `cache.json` path is `process.cwd()/src/data/cache.json`; run `next dev` from the repo root.
- The cache key is the lower-cased title; a renamed idea loses its cache entry.
