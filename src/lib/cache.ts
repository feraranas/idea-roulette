import path from "path";
import { readFile, writeFile } from "fs/promises";

import { buildPrompt, type BuildPromptInput } from "./ai/prompt";
import { getOpenAI } from "./ai/openai";

const CACHE_FILE = path.join(process.cwd(), "src", "data", "cache.json");

// Simple in-process mutex to serialize cache writes
let cacheLock: Promise<void> = Promise.resolve();
async function withCacheLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = cacheLock;
  let release: () => void;
  cacheLock = new Promise<void>((res) => {
    release = res;
  });
  await previous;
  try {
    return await fn();
  } finally {
    // @ts-expect-error release is assigned above
    release();
  }
}

export async function readCache(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const data = JSON.parse(raw);
    return data && typeof data === "object"
      ? (data as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export async function writeCache(cache: Record<string, string>): Promise<void> {
  const serialized = JSON.stringify(cache, null, 2) + "\n";
  await writeFile(CACHE_FILE, serialized, "utf8");
}

export function cacheKeyFromInput(
  input: Pick<BuildPromptInput, "title">,
): string {
  return input.title.trim().toLowerCase();
}

export async function ensureTasklistCached(
  input: BuildPromptInput,
): Promise<{ cached: boolean }> {
  const key = cacheKeyFromInput(input);
  const cache = await readCache();
  if (cache[key] && typeof cache[key] === "string" && cache[key].trim()) {
    return { cached: true } as const;
  }

  const openai = getOpenAI();
  const prompt = buildPrompt(input);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  });

  const markdown = completion.choices?.[0]?.message?.content ?? "";

  if (!markdown.trim()) {
    throw new Error("OpenAI returned an empty response");
  }

  // Serialize write and re-check to avoid lost updates under concurrency
  await withCacheLock(async () => {
    const latest = await readCache();
    if (!latest[key] || !latest[key].trim()) {
      latest[key] = markdown;
      await writeCache(latest);
    }
  });

  return { cached: false } as const;
}

export async function getCachedTasklist(
  input: BuildPromptInput,
): Promise<string | null> {
  const key = cacheKeyFromInput(input);
  const cache = await readCache();
  const value = cache[key];
  return value && typeof value === "string" && value.trim() ? value : null;
}

export async function generateTasklistWithCache(
  input: BuildPromptInput,
): Promise<string> {
  const key = cacheKeyFromInput(input);
  const cache = await readCache();
  const cachedMarkdown = cache[key];
  if (
    cachedMarkdown &&
    typeof cachedMarkdown === "string" &&
    cachedMarkdown.trim()
  ) {
    return cachedMarkdown;
  }

  const openai = getOpenAI();
  const prompt = buildPrompt(input);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  });

  const markdown = completion.choices?.[0]?.message?.content ?? "";

  if (!markdown.trim()) {
    throw new Error("OpenAI returned an empty response");
  }

  await withCacheLock(async () => {
    const latest = await readCache();
    if (!latest[key] || !latest[key].trim()) {
      latest[key] = markdown;
      await writeCache(latest);
    }
  });

  return markdown;
}
