import "dotenv/config";

import { ideas } from "../src/data/ideas";
import { ensureTasklistCached } from "../src/lib/cache";

async function main() {
  const limit = 20;
  const targets = ideas.slice(0, limit);

  let ensured = 0;
  for (const idea of targets) {
    process.stdout.write(`• ${idea.title} ... `);
    try {
      const { cached } = await ensureTasklistCached({
        title: idea.title,
        summary: idea.summary,
        one_pager: idea.one_pager,
      });
      ensured += 1;
      console.log(cached ? "already cached" : "generated");
    } catch (err) {
      console.log("FAILED");
      console.error(err instanceof Error ? err.message : err);
      // continue on error
    }
  }

  console.log(`\nDone. Ensured ${ensured}/${targets.length} ideas in cache.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


