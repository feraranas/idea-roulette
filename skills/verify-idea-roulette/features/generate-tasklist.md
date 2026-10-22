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
- **Error path.** Make one idea uncached in a scratch copy only, never by editing the committed `cache.json`. With no key, generate must show `Something went wrong`. Not yet scripted.

## Gotchas

- `gen-live` is unverified: it is a paid OpenAI call and writes `src/data/cache.json` in the repo.
- `cache.json` path is `process.cwd()/src/data/cache.json`; run `next dev` from the repo root.
- The cache key is the lower-cased title; a renamed idea loses its cache entry.
