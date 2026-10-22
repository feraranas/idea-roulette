## Verification

To prove the one-page flow works (spin → idea → AI task list → Copy), use the verification skill at `skills/verify-idea-roulette/SKILL.md` (also linked from `.cursor/skills/` and `.claude/skills/`):

```bash
export RUN_ID=$(date +%s)
skills/verify-idea-roulette/scripts/appctl launch
skills/verify-idea-roulette/scripts/appctl doctor
skills/verify-idea-roulette/scripts/appctl journey spin-to-tasklist
skills/verify-idea-roulette/scripts/appctl cleanup
```

It runs `next dev` on its own port with no OpenAI key and a throwaway auth secret, and drives headless Chrome through playwright-core installed outside the repo. Feature recipes are in `skills/verify-idea-roulette/features/`.
