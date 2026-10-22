// Offline check that src/data/cache.json covers every idea in src/data/ideas.json.
// No API calls. Usage: npm run check-cache
// Exit 1 when an idea has no (or an empty) cached task list; keys that match
// no idea are reported as warnings.
import { ideas } from "../src/data/ideas";
import { cacheKeyFromInput, readCache } from "../src/lib/cache";

async function main() {
  const cache = await readCache();
  const keys = new Set(ideas.map((idea) => cacheKeyFromInput(idea)));

  const missing = ideas.filter((idea) => !cache[cacheKeyFromInput(idea)]?.trim());
  const orphans = Object.keys(cache).filter((key) => !keys.has(key));

  for (const idea of missing) console.log(`missing: ${idea.title}`);
  for (const key of orphans) console.log(`warning: cache key matches no idea: ${key}`);
  console.log(
    `${ideas.length - missing.length}/${ideas.length} ideas cached, ${orphans.length} orphan key(s)`,
  );
  if (missing.length) {
    console.log("Run `npm run warm-cache` (calls OpenAI) to fill the gaps.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
