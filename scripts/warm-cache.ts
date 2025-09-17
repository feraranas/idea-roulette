import "dotenv/config";

import { ideas } from "../src/data/ideas";
import { ensureTasklistCached } from "../src/lib/cache";

async function main() {
  const limit = 20;
  const targets = ideas.slice(0, limit);

  const BATCH_SIZE = 5;
  let ensured = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (idea) => {
        try {
          const { cached } = await ensureTasklistCached({
            title: idea.title,
            summary: idea.summary,
            one_pager: idea.one_pager,
          });
          return cached ? "already cached" : "generated";
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return `FAILED (${msg})`;
        }
      }),
    );

    results.forEach((status, idx) => {
      const idea = batch[idx]!;
      const ok = !status.startsWith("FAILED");
      if (ok) ensured += 1;
      console.log(`• ${idea.title} ... ${status}`);
    });
  }

  console.log(`\nDone. Ensured ${ensured}/${targets.length} ideas in cache.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
