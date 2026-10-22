# Copy, regenerate and reset

Task-list panel actions: copy the markdown to the clipboard, regenerate, or start over.

## Sub-features

- `copy` button `Copy` writes the raw markdown to the clipboard and toasts `Task list copied`.
- `regenerate` buttons `Regenerate` / `Generate again` re-run generate (cache hit returns the same markdown).
- `reset` button `Pick another idea` returns to the idle page.

## How to get to it (user POV)

- From a ready task list, use the buttons in the panel header and under the main button.

## Driving it with appctl

Preconditions:

- Task list ready (after `generate-tasklist`).

- **Copy.** Journey step 5: click `Copy`; `result.json` `clipboardEqualsCache: true`. Observed with 12,158 chars for `Subcontractor Invoice Reconciliation Tool`.
- **Reset.** Click `Pick another idea`; heading `AI Task-List Creator` and button `Pick a Random Startup Idea` return. Not yet scripted.
- **Regenerate.** Click `Regenerate`; a second `tasklist.generate` 200 with identical panel text. Not yet scripted.

## Gotchas

- Headless Chrome needs `clipboard-read`/`clipboard-write` granted for the app origin, or `Copy` falls back and the clipboard read fails.
