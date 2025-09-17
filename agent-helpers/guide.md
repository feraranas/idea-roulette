Below are the three files you asked for. They’re ready to paste into your repo.

---

````design-guide.md
# Task‑List‑Creation Demo App — Design Guide

> **Purpose (on‑stage demo):**
> A one‑page Next.js app that *randomly selects a startup idea*, shows a short “slot machine” animation, renders the picked idea’s **title / summary / one_pager** (markdown), and on click of **“Create AI Agent Tasklist”** calls an LLM (GPT‑5) with a carefully‑crafted prompt to return a **detailed, one‑story‑point checklist** (including *Storybook* work) for building a **single‑page prototype** following **atomic design** (atoms, organisms, page). The app displays the LLM’s markdown, includes a **Copy** button, and shows a **copied** confirmation.

---

## 1) Foundation & Stack

This app is built on the **Next AI Starter** from @kleneway. The starter provides:

- **Next.js 14 (App Router) + TypeScript** and a project structure under `app/` and `src/` (with `components/`, `lib/`, `stories/`) suited for full‑stack apps. :contentReference[oaicite:0]{index=0}
- **tRPC** for type‑safe server routes, **Prisma** for ORM, **NextAuth** for auth (unused here), **Tailwind CSS** for styling. :contentReference[oaicite:1]{index=1}
- **UI/Dev tooling:** **Storybook** already configured via a `.storybook/` folder, **Framer Motion** for animation, **Lucide icons**, **Geist font**, and **react‑toastify** for toasts. :contentReference[oaicite:2]{index=2}
- **AI integration options** (OpenAI, Anthropic, Perplexity, Groq) plus **Inngest** for background jobs (unused here). :contentReference[oaicite:3]{index=3}

> We will only use: Next.js App Router, TypeScript, Tailwind, **Framer Motion** (Motion), **Storybook**, **react-toastify**, and a single **tRPC** (or API route) to call GPT‑5.

**Libraries referenced in this guide**

- **Framer Motion** (now **Motion**) docs for React animations (we’ll use `motion.div` and timing/easing). :contentReference[oaicite:4]{index=4}
- **react-markdown** to render `summary` and `one_pager`. :contentReference[oaicite:5]{index=5}
- **Storybook for Next.js** framework docs (App Router compatible). :contentReference[oaicite:6]{index=6}

---

## 2) User Flow (what’s on stage)

1. **Landing state (single page):**
   - Header/title + a short line of copy.
   - **“Pick a Random Startup Idea”** button.

2. **Slot animation (5–10 seconds):**
   - Upon click, we show a **vertical ticker** rapidly cycling through idea titles (fake “spins”) and then decelerating to the chosen idea.
   - Use **Framer Motion** for smooth y‑translate animations and easing. :contentReference[oaicite:7]{index=7}

3. **Chosen idea view (randomizer UI disappears):**
   - Show **Title** (h1), **Summary** (markdown), **One Pager** (markdown, collapsible).
   - Big CTA: **“Create AI Agent Tasklist”**.

4. **Generate task list:**
   - Click triggers **loading indicator**; call server (tRPC/route) with `{ title, summary, one_pager }` and the **prompt template** (below).
   - Receive LLM markdown; render read‑only with `react-markdown`.
   - **Copy** button copies the full markdown and shows **“Task list copied”** toast.

5. **(Optional) Pick Another Idea** — a small secondary link to reset to step 1.

> **Scope constraints** (show these on the page, small caption):
> *This demo generates tasks for a single‑page prototype only. No auth, backend, or production features—just the core UX to illustrate Storybook‑driven development.*

---

## 3) Data

A local JSON file of 20 ideas (provided by you):

```ts
// src/data/ideas.json
type Idea = {
  title: string;
  summary: string;     // markdown string
  one_pager: string;   // longer markdown string
};
// Array<Idea> length == 20
````

At runtime we keep ideas in memory (no DB). We don’t persist the chosen idea.

---

## 4) Prompts (the “critical” part)

### 4.1 Prompt philosophy

- Input: `{title, summary, one_pager}`.
- Output:

  1. A **single detailed paragraph** (what the prototype page must do).
  2. A **markdown checklist** of **one‑story‑point** items, explicitly including **Storybook** work and **atomic design** sections (**Atoms**, **Organisms**, **Page**).

- Explicitly **exclude** auth, settings, routing beyond one page, data persistence, and unrelated polish.
- The checklist must be executable by an AI agent or human without ambiguity (include file names, props, and Storybook CSF3 stories).

### 4.2 **Prompt template** (verbatim)

> **SYSTEM**
> You are a senior front‑end tech lead. Produce implementation‑ready tasks that an AI agent can complete independently. Follow the rules exactly.
>
> **RULES**
>
> - Scope: **Single‑page prototype only** to demonstrate the core UX of the startup idea. **No auth, no backend, no payments, no persistence, no forms beyond the prototype needs**.
> - Architecture: React + Next.js App Router; **atomic design (three levels only): Atoms, Organisms, Page**.
> - **Storybook is mandatory**: Every component and the Page must have CSF3 stories with docs/controls and at least one accessibility check.
> - Output is **Markdown only**, no code fences inside list items unless necessary; each checklist item is **one story point**, small and deliverable in isolation.
> - Favor clarity: reference intended file paths (e.g., `src/components/atoms/Button.tsx`).
> - Keep the tone terse and imperative.
> - **Do not include** authentication, authorization, data persistence, or production hardening.
>
> **INPUT**
> Title: {{title}}
> Summary (markdown):
> {{summary}}
>
> One‑pager (markdown):
> {{one\_pager}}
>
> **OUTPUT FORMAT (exactly this order):**
>
> 1. **Prototype overview** — one paragraph (4–8 sentences) describing what the **single page** will show and how a user will interact with it to demonstrate the core idea.
> 2. **Checklist** — a hierarchical markdown checklist of one‑story‑point items with these top‑level sections (and only these):
>
>    - **Atoms** (UI primitives).
>    - **Organisms** (compositions of atoms that have behavior/logic).
>    - **Page** (single page assembly and wiring).
>    - **Storybook** (stories for each atom/organism/page, with docs, controls, and an a11y pass).
>
> **Checklist conventions:**
>
> - Use `- [ ]` for each item.
> - For each item, include: what to build, where to place it (path), and the minimal props/acceptance criteria.
> - For Storybook items, specify at least: `Default`, `Edge cases`, and `A11y` stories.
> - Keep the entire output under 1,200 lines.
>
> **BEGIN.**

> **Note:** This template makes the LLM output a paragraph **and** a **checklist** laid out in Atomic/Storybook sections while repeatedly emphasizing “single‑page only” and “Storybook required”, which is the crux of the demo.

---

## 5) UI/UX & Component Plan (Atomic)

We will follow **atomic design** truncated to **Atoms → Organisms → Page**.

### Atoms (in `src/components/atoms/`)

- **Button** — sizes (md, lg), states (default, disabled, loading), full‑width option.
- **Icon** — wrapper around Lucide (optional).
- **Spinner** — small inline spinner for busy states.
- **CopyButton** — wraps clipboard logic with success toast.
- **MarkdownRenderer** — `react-markdown` with a minimal components map for headings/links/code.
- **Card** — simple container with padding, radius, border.
- **Kicker** — small caption text used for “Single‑page prototype only” notice.

### Organisms (in `src/components/organisms/`)

- **IdeaSlotMachine**

  - Props: `ideas: Idea[]`, `durationMs: number` (default 6500), `onDone(idea: Idea)`
  - Shows animated list of titles; cycles rapidly, then eases to a stop. Implement with **Framer Motion** transitions/easing. ([motion.dev][1])

- **IdeaDetails**

  - Props: `idea: Idea`, `defaultExpanded?: boolean`
  - Renders Title (h1), Summary (markdown), expand/collapse One‑pager (markdown).

- **TasklistPanel**

  - Props: `markdown: string`, `onCopy(): void`
  - Read‑only rendered markdown with sticky header actions: **Copy** and “Regenerate” (optional).

### Page (in `app/page.tsx`)

- Single page, client component. States: `idle | spinning | chosen | generating | ready | error`.

---

## 6) Visual & Interaction Details

- **Slot animation (5–10s):** default to \~6.5s with a deceleration curve; allow `durationMs` override.
  Implementation sketch:

  - Prepare an array of N \* 4 titles; animate `y` translate of a container through items; on final tick set the chosen index; replace slot with **IdeaDetails**.
  - Use `motion.div` with `animate={{ y: -rowHeight * targetIndex }}` and `transition={{ duration, ease: [0.12, 0.49, 0.34, 1] }}`. ([motion.dev][1])

- **Markdown rendering:** use `react-markdown`; optionally add `remark-gfm` for tables/lists. Keep styling via Tailwind prose classes or a tiny typography layer. ([GitHub][2])

- **Toasts:** use `react-toastify` which ships in the starter. Show “Task list copied” (2s). ([GitHub][3])

- **A11y & motion:**

  - Respect `prefers-reduced-motion` (reduce duration to 500–800ms single tick reveal).
  - Use `role="status"` for loading, `aria-live="polite"` for result arrival.
  - Buttons are keyboard accessible and focus‑visible.

---

## 7) App Structure & Key Files

```
app/
  page.tsx                     # One-page app (client component)
  api/
    tasklist/route.ts         # (Option A) API route to call GPT-5

src/
  components/
    atoms/
      Button.tsx
      Spinner.tsx
      CopyButton.tsx
      MarkdownRenderer.tsx
      Card.tsx
      Kicker.tsx
    organisms/
      IdeaSlotMachine.tsx
      IdeaDetails.tsx
      TasklistPanel.tsx
  lib/
    ai/
      prompt.ts               # Prompt template (above) exported as a function
      openai.ts               # OpenAI client factory (model name from env)
  data/
    ideas.json                # 20 ideas (title, summary, one_pager)
  stories/                    # Storybook stories for all atoms/organisms/page
```

> The starter repo already contains **`.storybook/`** and a **`stories/`** folder scaffold, so we add new CSF3 stories there. ([GitHub][3])

---

## 8) API Integration

Two equivalent approaches—pick one.

### Option A — Next.js App Router API route

```ts
// app/api/tasklist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/src/lib/ai/openai";
import { buildPrompt } from "@/src/lib/ai/prompt";

export async function POST(req: NextRequest) {
  const { title, summary, one_pager } = await req.json();
  if (!title || !summary || !one_pager) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const openai = getOpenAI();
  const prompt = buildPrompt({ title, summary, one_pager });

  // Plain completion (non-stream for demo predictability)
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5",
    temperature: 0.2,
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  });

  const content = completion.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ markdown: content });
}
```

### Option B — tRPC procedure (aligns with starter’s pattern)

```ts
// src/lib/api/routers/tasklist.ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { getOpenAI } from "@/src/lib/ai/openai";
import { buildPrompt } from "@/src/lib/ai/prompt";

export const tasklistRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        one_pager: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const openai = getOpenAI();
      const prompt = buildPrompt(input);
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5",
        temperature: 0.2,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      });
      return { markdown: completion.choices?.[0]?.message?.content ?? "" };
    }),
});

// src/lib/api/root.ts
export const appRouter = router({
  tasklist: tasklistRouter,
});
export type AppRouter = typeof appRouter;
```

---

## 9) Client (page.tsx) Sketch

```tsx
"use client";

import { useState } from "react";
import ideas from "@/src/data/ideas.json";
import { Card } from "@/src/components/atoms/Card";
import { Button } from "@/src/components/atoms/Button";
import { IdeaSlotMachine } from "@/src/components/organisms/IdeaSlotMachine";
import { IdeaDetails } from "@/src/components/organisms/IdeaDetails";
import { TasklistPanel } from "@/src/components/organisms/TasklistPanel";
import { toast } from "react-toastify";

export default function Page() {
  const [state, setState] = useState<
    "idle" | "spinning" | "chosen" | "generating" | "ready" | "error"
  >("idle");
  const [chosen, setChosen] = useState<Idea | null>(null);
  const [markdown, setMarkdown] = useState<string>("");

  const pickIdea = () => {
    setState("spinning");
  };

  const onSpinDone = (idea: Idea) => {
    setChosen(idea);
    setState("chosen");
  };

  const generate = async () => {
    if (!chosen) return;
    setState("generating");
    try {
      const res = await fetch("/api/tasklist", {
        method: "POST",
        body: JSON.stringify(chosen),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMarkdown(data.markdown ?? "");
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Task list copied");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">AI Task‑List Creator</h1>
      <p className="text-sm text-muted-foreground">
        Single‑page prototype generator (no auth, no backend).
      </p>

      {state === "idle" && (
        <Card className="mt-8">
          <Button onClick={pickIdea} size="lg">
            Pick a Random Startup Idea
          </Button>
        </Card>
      )}

      {state === "spinning" && (
        <IdeaSlotMachine ideas={ideas} durationMs={6500} onDone={onSpinDone} />
      )}

      {(state === "chosen" || state === "generating" || state === "ready") &&
        chosen && (
          <section className="mt-8 space-y-6">
            <IdeaDetails idea={chosen} />
            <Button
              onClick={generate}
              size="lg"
              disabled={state === "generating"}
            >
              Create AI Agent Tasklist
            </Button>

            {state === "ready" && (
              <TasklistPanel markdown={markdown} onCopy={copy} />
            )}
          </section>
        )}

      {state === "error" && (
        <p role="alert" className="text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
    </main>
  );
}
```

---

## 10) Storybook

- The starter already includes **Storybook** (see `.storybook/`). We’ll add stories for each **atom**, **organism**, and the **page** using the **Next.js framework for Storybook** (supports App Router). ([GitHub][3])

Story examples to include:

- **Atoms**: `Button` (default/disabled/loading/keyboard focus), `CopyButton` success path (mock clipboard), `MarkdownRenderer` (headings, code, links).
- **Organisms**: `IdeaSlotMachine` with short (1s) duration and a “reduced‑motion” story; `IdeaDetails` expanded/collapsed; `TasklistPanel` with long markdown.
- **Page**: controlled mock states (`idle`, `spinning`, `chosen`, `generating`, `ready`, `error`) via Storybook controls.

---

## 11) Styling

Minimal Tailwind with a neutral base; use a **Card** pattern to group content. Prefer system font stack or **Geist** (present via starter). ([GitHub][3])

---

## 12) Environment & Configuration

Create `.env.local`:

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
```

> The starter supports multiple AI providers; we use OpenAI here and read `OPENAI_API_KEY` on the server only. ([GitHub][3])

---

## 13) Accessibility & Perf

- Respect **reduced motion**; provide a 1‑step reveal fallback for the slot.
- All buttons are keyboard accessible, with `aria-live="polite"` for generation result.
- Keep bundle minimal; no external heavy UI kits.

---

## 14) Error Handling

- Missing idea fields → 400 response with message.
- LLM error → show toast + inline error message, enable **Regenerate**.
- Clipboard fallback: if `navigator.clipboard` fails, select text in a hidden `<textarea>` and exec copy.

---

## 15) Local Dev & Scripts

```bash
# from the Next AI Starter template
npm i
cp .env.example .env.local  # then edit OPENAI_*
npm run dev

# Storybook
npm run storybook
```

Defer DB/auth/Resend/Inngest; we don’t run `prisma migrate` for this demo. ([GitHub][3])

---

## 16) Deployment

Deploy to **Vercel** (the starter is optimized for it). Make sure to add `OPENAI_API_KEY` and `OPENAI_MODEL` env vars in project settings. ([GitHub][3])

---

## 17) Risks & Mitigations

- **LLM latency/variability** → keep non‑streaming call; show spinner; allow regenerate.
- **On‑stage timing** → the slot machine has a fixed default (6.5s); configure via query param `?fast=1` to shorten locally if needed.
- **Markdown overflow** → TasklistPanel uses `max-h` + `overflow-auto`.

---

```

---



```
