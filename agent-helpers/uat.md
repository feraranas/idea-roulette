```uat.md
# UAT Script — Task‑List‑Creation Demo App

**Test target:** One‑page Next.js app (Next AI Starter base) that selects a random idea, animates selection, renders idea markdown, generates an AI task list (markdown), and supports “Copy”.

**Environment:**
- Desktop Chrome (latest), Safari, Firefox.
- Optional mobile Safari/Chrome.
- Vercel preview or local `http://localhost:3000`.
- `.env` has valid `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-5`.

---

## 1) Smoke & Layout

1. **Load** the root page `/`.
   - **Expect:** Page title “AI Task‑List Creator”, sub‑caption about single‑page prototype.
   - **Expect:** Prominent button **“Pick a Random Startup Idea”**.

2. **No console errors** in DevTools.
   - **Pass if:** 0 red errors; only innocuous warnings allowed.

---

## 2) Random Idea & Animation

3. **Click** “Pick a Random Startup Idea”.
   - **Expect:** Slot‑style list of idea titles appears and begins cycling.

4. **Timing check:**
   - **Expect:** Animation lasts between **5 and 10 seconds** (default configured ≈6.5s).
   - **Accessibility:** With `prefers-reduced-motion` enabled (OS setting), re‑run: the animation should be near instant (≤ 800ms) without continuous motion.

5. **Finalization:**
   - **Expect:** Animation stops; the randomizer UI disappears; the chosen idea view is shown.

---

## 3) Idea Rendering

6. **Chosen idea view** shows:
   - **Title** as H1.
   - **Summary** rendered via markdown (headings/links styled).
   - **One‑pager** markdown is visible or behind an **Expand/Collapse** toggle (either default is fine if documented).
   - **CTA:** Big **“Create AI Agent Tasklist”** button.

7. **Formatting audit:**
   - Check that long paragraphs wrap; lists render properly; code spans use monospace.

---

## 4) Generate AI Task List

8. **Click** “Create AI Agent Tasklist”.
   - **Expect:** Button enters **loading/disabled** state and a spinner or “Generating…” indicator appears.

9. **Response handling:**
   - **Success path:** A markdown block appears as read‑only content.
   - **Error path (forced by temporarily breaking API key):** Inline error message appears; retry button or normal CTA becomes enabled again.

10. **Content validation (CRITICAL):**
    - The returned markdown contains **one detailed paragraph** describing the prototype **followed by** a **checklist of one‑story‑point items** grouped into these **exact** top‑level sections:
      - **Atoms**
      - **Organisms**
      - **Page**
      - **Storybook**
    - **Expect:** Each checklist item uses `- [ ]` and mentions what/where (file path or component) and minimal acceptance criteria.
    - **Expect:** The **Storybook** section includes stories for **every component and the page** (CSF3), including an **a11y** entry.

---

## 5) Copy Interaction

11. **Click** **Copy**.
    - **Expect:** The entire markdown task list is copied to clipboard.
    - **Expect:** A toast appears: **“Task list copied”** (disappears automatically).
    - **Manual check:** Paste into a text editor to confirm content matches what’s rendered.

12. **Clipboard fallback:** (If possible) temporarily block clipboard permissions and click **Copy** again.
    - **Expect:** Fallback strategy still copies (or shows a clear failure message if the browser forbids it).

---

## 6) Page State Management

13. **State transitions:**
    - **idle → spinning → chosen → generating → ready** is observed on the happy path.
    - Trigger a failure (bad API key) to observe **generating → error** and that the app recovers after re‑enabling a good key.

14. **Reset flow:**
    - If a **“Pick another idea”** link/button exists, click it.
    - **Expect:** App returns to **idle** with no stale state.

---

## 7) Storybook Verification

15. **Run Storybook** (`npm run storybook`) and open in the browser.
    - **Expect:** A sidebar section for **Atoms**, **Organisms**, and **Page**.

16. **Atoms**
    - `Button`: View Default/Loading/Disabled/FullWidth; interact with Controls to change `size`/`loading`.
    - `Spinner`: Renders visibly; a11y panel shows no violations.
    - `CopyButton`: Clicking triggers an action/console (mocked clipboard).
    - `MarkdownRenderer`: Displays headings/links/code; long text story works.

17. **Organisms**
    - `IdeaSlotMachine`: Short duration story (≈1.2s) animates and stops; “Reduced‑motion” story shows minimal motion.
    - `IdeaDetails`: Expanded/Collapsed variants render.
    - `TasklistPanel`: Long content scrolls; sticky header with **Copy** present.

18. **Page**
    - Story with **controls** to toggle states (`idle`, `spinning`, etc.) works; no console errors.

---

## 8) Cross‑Browser & Mobile

19. **Chrome, Safari, Firefox**: Happy path works identically.
20. **Mobile** (optional): Check layout does not overflow horizontally; buttons are large enough to tap.

---

## 9) Performance & A11y

21. **Perf quick check:** Page loads without significant layout shift; animation is smooth.
22. **A11y:** Keyboard tab order sane; focus ring visible; `aria-live="polite"` announces the generated result.

---

## 10) Deploy Smoke

23. **Vercel preview** with env vars set: Happy path (Pick → Generate → Copy) works.
24. **Logs:** No 500 errors for `POST /api/tasklist` during demo run.

**Pass Criteria:** All expectations above are met, and the generated checklist clearly includes **Storybook work** and **Atomic (Atoms/Organisms/Page)** sections, reinforcing the demo’s teaching goals.
```
