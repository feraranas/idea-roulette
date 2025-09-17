export type BuildPromptInput = {
  title: string;
  summary: string;
  one_pager: string;
};

export type PromptPayload = {
  system: string;
  user: string;
};

const SYSTEM_PROMPT = `You are a senior front-end tech lead. Produce implementation-ready tasks that an AI agent can complete independently. Follow the rules exactly.`;

const RULES_BLOCK = `RULES
- Scope: Single-page prototype only to demonstrate the core UX of the startup idea. No auth, no backend, no payments, no persistence, no forms beyond the prototype needs.
- Architecture: React + Next.js App Router; atomic design (three levels only): Atoms, Organisms, Page.
- Storybook is mandatory: Every component and the Page must have CSF3 stories with docs/controls and at least one accessibility check.
- Output is Markdown only, no code fences inside list items unless necessary; each checklist item is one story point, small and deliverable in isolation.
- Favor clarity: reference intended file paths (e.g., src/components/atoms/Button.tsx).
- Keep the tone terse and imperative.
- Do not include authentication, authorization, data persistence, or production hardening.`;

const OUTPUT_FORMAT_BLOCK = `OUTPUT FORMAT (exactly this order):
1. **Prototype overview** — one paragraph (4–8 sentences) describing what the single page will show and how a user will interact with it to demonstrate the core idea.
2. **Checklist** — a hierarchical markdown checklist of one-story-point items with these top-level sections (and only these):
   - **Atoms** (UI primitives).
   - **Organisms** (compositions of atoms that have behavior/logic).
   - **Page** (single page assembly and wiring).
   - **Storybook** (stories for each atom/organism/page, with docs, controls, and an a11y pass).

Checklist conventions:
- Use - [ ] for each item.
- For each item, include: what to build, where to place it (path), and the minimal props/acceptance criteria.
- For Storybook items, specify at least: Default, Edge cases, and A11y stories.
- Keep the entire output under 1,200 lines.

BEGIN.`;

export const buildPrompt = ({ title, summary, one_pager }: BuildPromptInput): PromptPayload => {
  const userContent = `${RULES_BLOCK}

INPUT
Title: ${title}
Summary (markdown):
${summary}

One-pager (markdown):
${one_pager}

${OUTPUT_FORMAT_BLOCK}`;

  return {
    system: SYSTEM_PROMPT,
    user: userContent,
  };
};
