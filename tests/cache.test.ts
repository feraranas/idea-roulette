// Behavior of the task-list cache (src/lib/cache.ts) as the tRPC router and
// warm-cache script see it. OpenAI is replaced by a local HTTP server via
// OPENAI_BASE_URL; cache.json is a temp copy. No network, no API key.
// Run: npm test
import { after, before, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

type CacheModule = typeof import("../src/lib/cache");

const idea = (title: string) => ({ title, summary: "s", one_pager: "p" });
const workDir = mkdtempSync(path.join(tmpdir(), "idea-roulette-cache-"));
const cacheFile = path.join(workDir, "src", "data", "cache.json");
const readCacheFile = () => JSON.parse(readFileSync(cacheFile, "utf8"));

let server: Server;
let reply = "# Generated task list";
let requests: Array<{ model: string; messages: Array<{ role: string }> }> = [];
let cache: CacheModule;

before(async () => {
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      requests.push(JSON.parse(body));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ id: "x", object: "chat.completion", created: 0, model: "m",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: reply } }] }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${port}/v1`;
  mkdirSync(path.dirname(cacheFile), { recursive: true });
  process.chdir(workDir);
  cache = await import("../src/lib/cache");
});

after(() => server.close());

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-key";
  reply = "# Generated task list";
  requests = [];
  writeFileSync(cacheFile, JSON.stringify({ "cached idea": "# Cached task list" }));
});

describe("generateTasklistWithCache", () => {
  test("returns the cached task list without calling OpenAI, ignoring title case and spaces", async () => {
    assert.equal(await cache.generateTasklistWithCache(idea("  Cached Idea ")), "# Cached task list");
    assert.equal(requests.length, 0);
  });

  test("on a miss, generates once, stores it under the lowercased title, then serves it from cache", async () => {
    assert.equal(await cache.generateTasklistWithCache(idea("New Idea")), "# Generated task list");
    assert.equal(readCacheFile()["new idea"], "# Generated task list");
    assert.equal(await cache.generateTasklistWithCache(idea("new idea")), "# Generated task list");
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].messages.map((m) => m.role), ["system", "user"]);
  });

  test("an empty OpenAI reply is an error and is not cached", async () => {
    reply = "  ";
    await assert.rejects(cache.generateTasklistWithCache(idea("Blank")), /OpenAI returned an empty response/);
    assert.equal(readCacheFile()["blank"], undefined);
  });

  test("a miss without OPENAI_API_KEY fails with a clear message", async () => {
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(cache.generateTasklistWithCache(idea("Uncached")), /OPENAI_API_KEY is not set/);
    assert.equal(await cache.generateTasklistWithCache(idea("Cached idea")), "# Cached task list");
  });
});

describe("ensureTasklistCached", () => {
  test("reports cached: false when it had to generate, then cached: true", async () => {
    assert.deepEqual(await cache.ensureTasklistCached(idea("Fresh")), { cached: false });
    assert.deepEqual(await cache.ensureTasklistCached(idea("Fresh")), { cached: true });
    assert.equal(requests.length, 1);
  });

  test("concurrent misses for different ideas are all persisted", async () => {
    await Promise.all(["A", "B", "C", "D", "E"].map((t) => cache.ensureTasklistCached(idea(t))));
    const stored = readCacheFile();
    for (const key of ["a", "b", "c", "d", "e", "cached idea"]) assert.ok(stored[key], `missing ${key}`);
  });
});
