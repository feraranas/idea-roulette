export type BuildPromptInput = {
  title: string;
  summary: string;
  one_pager: string;
};

export type PromptPayload = {
  system: string;
  user: string;
};

const CURSOR_RULES = `# .cursorrules

Components & Naming

- Use functional components with \`"use client"\` if needed.
- Name in PascalCase under \`src/components/\`.
- Keep them small, typed with interfaces.
- Use Tailwind for common UI components like textarea, button, etc. Never use radix or shadcn.

Prisma

- Manage DB logic with Prisma in \`prisma/schema.prisma\`, \`src/lib/db.ts\`.
- snake_case table → camelCase fields.
- No raw SQL; run \`npx prisma migrate dev\`, never use \`npx prisma db push\`.

Icons

- Prefer \`lucide-react\`; name icons in PascalCase.
- Custom icons in \`src/components/icons\`.

Toast Notifications

- Use \`react-toastify\` in client components.
- \`toast.success()\`, \`toast.error()\`, etc.

Next.js Structure

- Use App Router in \`app/\`. Server components by default, \`"use client"\` for client logic.
- NextAuth + Prisma for auth. \`\.env\` for secrets.

tRPC Routers

- Routers in \`src/lib/api/routers\`, compose in \`src/lib/api/root.ts\`.
- \`publicProcedure\` or \`protectedProcedure\` with Zod.
- Access from React via \`@/lib/trpc/react\`.

TypeScript & Syntax

- Strict mode. Avoid \`any\`.
- Use optional chaining, union types (no enums).

File & Folder Names

- Next.js routes in kebab-case (e.g. \`app/dashboard/page.tsx\`).
- Shared types in \`src/lib/types.ts\`.
- Sort imports (external → internal → sibling → styles).

Tailwind Usage

- Use Tailwind (mobile-first, dark mode with dark:(class)). Extend brand tokens in \`tailwind.config.ts\`.
- For animations, prefer Framer Motion.

Inngest / Background Jobs

- Use \`inngest.config.ts\` for Inngest configuration.
- Use \`src/app/api/inngest/route.ts\` for Inngest API route.
- Use polling to update the UI when Inngest events are received, not trpc success response.

AI

- Use \`generateChatCompletion\` in \`src/lib/aiClient.ts\` for all AI calls.
- Prefer \`O1\` model with high reasoning effort for all AI calls.

Storybook

- Place stories in \`src/stories\` with \`.stories.tsx\` extension.
- One story file per component, matching component name.
- Use autodocs for automatic documentation.
- Include multiple variants and sizes in stories.
- Test interactive features with actions.
- Use relative imports from component directory.

Tools

- When you make a change to the UI, use the \`screenshot\` tool to show the changes.
- If the user asks for a complex task to be performed, find any relevant files and call the \`architect\` tool to get a plan and show it to the user. Use this plan as guidance for the changes you make, but maintain the existing patterns and structure of the codebase.
- After a complex task is performed, use the \`codeReview\` tool create a diff and use the diff to conduct a code review of the changes.

Additional

- Keep code short; commits semantic.
- Reusable logic in \`src/lib/utils/shared.ts\` or \`src/lib/utils/server.ts\`.
- Use \`tsx\` scripts for migrations.

IMPORTANT:

- After all changes are made, ALWAYS build the project with \`npm run build\`. Ignore warnings, fix errors.
- Always add a one-sentence summary of changes to \`\.cursor-updates\` file in markdown format at the end of every agent interaction.
- If you forget, the user can type the command "finish" and you will run the build and update \`.cursor-updates\`.
- Finally, update git with \`git add . && git commit -m "..."\`. Don't push.
`;

const SYSTEM_PROMPT = `You are a technical fellow, the world's best software engineer who is also an expert technical product manager. Here are some .cursorrules to give you a high-level overview of the existing codebase.
<CURSOR_RULES>
${CURSOR_RULES}
</CURSOR_RULES>

Produce implementation-ready tasks that an AI agent can complete independently. Note that you are UPDATING an existing codebase and much of the initial setup is done. DO NOT include setup tasks! Ensure your output is in human-readable markdown format. Follow the rules exactly.`;

const RULES_BLOCK = `RULES
- Scope: Single-page prototype added to an existing codebase. The goal is only to add a single page to the default home page ( src/app/page.tsx ) to demonstrate the core UX of the startup idea. No auth, no backend, no payments, no persistence, no forms beyond the prototype needs.
- Architecture: React + Next.js App Router; atomic design (three levels only): Atoms, Organisms, Page.
- Storybook is mandatory: Every component and the Page must have CSF3 stories with docs/controls and at least one accessibility check.
- Output is Markdown only, no code fences inside list items unless necessary; each checklist item is one story point, small and deliverable in isolation.
- Favor clarity: reference intended file paths (e.g., src/components/atoms/Button.tsx).
- Design is important. Use design principles to guide your work. Use Tailwind to style the components. Don't use purple or overuse gradients. Use and extend the existing design system.
- Be detailed and specific when writing the doc, but also ensure it is human-readable and easy to understand.
- Note that you are UPDATING an existing codebase and much of the initial setup is done. DO NOT include setup tasks!
- Do not include authentication, authorization, data persistence, or production hardening.`;

const OUTPUT_FORMAT_BLOCK = `OUTPUT FORMAT in a markdown doc using headers, subheaders, and checklists with unchecked checkboxes. The user will be able to read this but primarily this will be used by the AI agent to complete the tasks.
1. **Prototype overview** — one paragraph (4–8 sentences) describing what the single page will show and how a user will interact with it to demonstrate the core idea.
2. **Checklist** — a hierarchical markdown checklist of one-story-point items to build the prototype. For the components, you must include these top-level sections:
   - **Atoms** (UI primitives) - After each atom task, add a task to create a story for the atom.
   - **Organisms** (compositions of atoms that have behavior/logic) - After each organism task, add a task to create a story for the organism.
   - **Page** (single page assembly and wiring) - Do not create a story for the page.
   - Any additional work that needs to be done to build the prototype. Remember that an AI agent will be using this checklist to build the prototype, so be sure to include all the details but keep it scoped to the prototype. Also remember that you are UPDATING an existing codebase (see <CURSOR_RULES> for details) and much of the initial setup is done. DO NOT include setup tasks!

Checklist conventions:
- Use - [ ] for each item.
- For each atom or organism, you MUST include a task to create a story for the component directly after the task to build the component.
- For Storybook items, specify at least: Default, Edge cases, and A11y stories.

BEGIN.`;

export const buildPrompt = ({
  title,
  summary,
  one_pager,
}: BuildPromptInput): PromptPayload => {
  const userContent = `${RULES_BLOCK}

You will be asked to create a task list to build a front-end prototype of the idea outlined in the <IDEA_DETAILS> section.
<IDEA_DETAILS>
Title: ${title}
Summary (markdown):
${summary}

One-pager (markdown):
${one_pager}
</IDEA_DETAILS>

Create a task list to build a front-end prototype of the idea outlined in the <IDEA_DETAILS> section.
${OUTPUT_FORMAT_BLOCK}`;

  return {
    system: SYSTEM_PROMPT,
    user: userContent,
  };
};
