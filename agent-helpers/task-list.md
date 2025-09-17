```task-list.md
# AI Agent Implementation Tasks (All 1 SP Each)

> **Scope:** Single‑page demo on top of Next AI Starter. No auth, no DB, no payments, no routing beyond `/`. Atomic design (Atoms, Organisms, Page). **Storybook for every component.**
> **Paths** assume a fresh clone of `kleneway/next-ai-starter`. :contentReference[oaicite:18]{index=18}

## Setup & Data
- [ ] **Create data file** `src/data/ideas.json` with 20 `Idea` objects (`title`, `summary`, `one_pager`). Validate shape and export `Idea` type.
- [ ] **Wire types** `src/types/idea.ts` (`export type Idea = { title: string; summary: string; one_pager: string }`); import where needed.
- [ ] **Install markdown lib** `react-markdown` (+ `remark-gfm` optional). Add to `package.json`. :contentReference[oaicite:19]{index=19}
- [ ] **Ensure Storybook runs** `npm run storybook` and commit the starter’s `.storybook/` config if missing. :contentReference[oaicite:20]{index=20}

## Atoms (`src/components/atoms/`)
- [ ] **Button.tsx**: Props `{ size?: 'md'|'lg'; loading?: boolean; fullWidth?: boolean }`. Renders `<button>` with Tailwind variants; shows spinner when `loading`.
- [ ] **Spinner.tsx**: Inline spinner (12×12), `role="status"`; respects reduced motion (no spin if `prefers-reduced-motion`).
- [ ] **CopyButton.tsx**: Props `{ getText: () => string }`. On click, writes to clipboard (fallback to `<textarea>`). Emits success toast `“Task list copied”`.
- [ ] **MarkdownRenderer.tsx**: Props `{ markdown: string }`. Uses `react-markdown` (and `remark-gfm` if added). Minimal components map for `h1..h4`, `a`, `code`.
- [ ] **Card.tsx**: Simple container with padding, radius, shadow; renders `children`.
- [ ] **Kicker.tsx**: Small subdued caption text.

## Organisms (`src/components/organisms/`)
- [ ] **IdeaSlotMachine.tsx**: Props `{ ideas: Idea[]; durationMs?: number; onDone: (idea: Idea) => void }`. Uses **Framer Motion** to translate a vertical list of titles over time; deterministic stop on a random index. :contentReference[oaicite:21]{index=21}
- [ ] **IdeaDetails.tsx**: Props `{ idea: Idea; defaultExpanded?: boolean }`. Renders Title (h1), Summary (markdown), Toggle to expand/collapse One‑pager (markdown).
- [ ] **TasklistPanel.tsx**: Props `{ markdown: string; onCopy: () => void }`. Header actions: **Copy** button; content scrollable; monospace for checklist.

## AI Integration (server)
- [ ] **Prompt builder** `src/lib/ai/prompt.ts`: Export `buildPrompt({title, summary, one_pager})` returning `{ system, user }` using the prompt in **Design Guide §4.2**.
- [ ] **OpenAI client** `src/lib/ai/openai.ts`: Create and export `getOpenAI()` that reads `OPENAI_API_KEY`; model from `OPENAI_MODEL || 'gpt-5'`.
- [ ] **API route** `app/api/tasklist/route.ts` (POST): Validate body; call OpenAI chat completion with `{ system, user }`; return `{ markdown }`.
    - _Alternative_: Implement `src/lib/api/routers/tasklist.ts` tRPC `generate` mutation returning `{ markdown }`. Register in `appRouter`. (Choose one.)

## Page (assembly)
- [ ] **Create page** `app/page.tsx` as a client component with state machine: `idle | spinning | chosen | generating | ready | error`.
- [ ] **Idle UI**: Centered Card with **“Pick a Random Startup Idea”** (Button size `lg`).
- [ ] **Spinning UI**: Render `IdeaSlotMachine` with `durationMs=6500`; onDone → set chosen idea and step to `chosen`.
- [ ] **Chosen UI**: Render `IdeaDetails` and a large **“Create AI Agent Tasklist”** button.
- [ ] **Generating UI**: Disable button, show spinner, call API/tRPC; on success set markdown and step to `ready`; on failure step to `error`.
- [ ] **Ready UI**: Render `TasklistPanel` with markdown + `onCopy`; show success toast on copy.
- [ ] **Error UI**: Inline error text + secondary button “Try again”.

## A11y & Motion
- [ ] Respect `prefers-reduced-motion`: `IdeaSlotMachine` switches to instant select (<=800ms) and `Spinner` stops rotation.
- [ ] Add `aria-live="polite"` for the tasklist container; buttons are keyboard focusable with visible outlines.
- [ ] All interactive items have descriptive `aria-label` or text content.

## Styling & Polish
- [ ] Add small **Kicker** below title: “Single‑page prototype only — no auth or persistence”.
- [ ] Constrain content width to `max-w-3xl`; ensure markdown styles are legible in light/dark.
- [ ] Ensure long markdown in `TasklistPanel` scrolls (`max-h-[60vh] overflow-auto`).

## Storybook (CSF3; `src/stories/`)
- [ ] **Button.stories.tsx**: Stories — Default / Loading / Disabled / FullWidth; Controls for `size`, `loading`.
- [ ] **Spinner.stories.tsx**: Stories — Default; a11y checks enabled.
- [ ] **CopyButton.stories.tsx**: Mock clipboard; Story — Copy Success (calls `args.getText`).
- [ ] **MarkdownRenderer.stories.tsx**: Stories — Headings/Links/Code; Edge — long content.
- [ ] **Card.stories.tsx**: Stories — Default (with children).
- [ ] **Kicker.stories.tsx**: Stories — Default.
- [ ] **IdeaSlotMachine.stories.tsx**: Short `durationMs=1200`; Reduced‑motion variant; Edge — 2 ideas only.
- [ ] **IdeaDetails.stories.tsx**: Expanded / Collapsed; Long markdown variant.
- [ ] **TasklistPanel.stories.tsx**: Long checklist; Copy button interaction (action logger).
- [ ] **Page.stories.tsx**: Controlled states (idle/spinning/chosen/generating/ready/error) using a wrapper that toggles state via controls.
- [ ] **Docs page**: Add a top‑level MDX docs file describing the single‑page architecture and the Slot animation.

## QA & Demo Prep
- [ ] Add a query param `?fast=1` to shorten slot to ~1500ms for rehearsals.
- [ ] Write a quick smoke test: render page; click spin; ensure chosen idea renders; mock fetch to return markdown; ensure Copy fires toast.
- [ ] Verify clipboard and toast in Chrome, Safari, Firefox.
- [ ] Verify Storybook loads and all stories render without console errors.

## Deployment
- [ ] Add `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-5` to Vercel env; deploy.
- [ ] Post‑deploy smoke run: Pick → Generate → Copy works; no 500s.

> **Done definition:** One page loads; slot animation runs (5–10s default), idea renders, **Generate** returns a markdown checklist that includes **Atoms / Organisms / Page / Storybook** sections, **Copy** shows a success toast, stories exist and render for all components.
```

---
