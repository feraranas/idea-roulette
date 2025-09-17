import { z } from "zod";

import { buildPrompt } from "@/lib/ai/prompt";
import { getOpenAI } from "@/lib/ai/openai";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";
import path from "path";
import { readFile, writeFile } from "fs/promises";

const CACHE_FILE = path.join(process.cwd(), "src", "data", "cache.json");

async function readCache(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const data = JSON.parse(raw);
    return (data && typeof data === "object") ? data : {};
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, string>): Promise<void> {
  const serialized = JSON.stringify(cache, null, 2) + "\n";
  await writeFile(CACHE_FILE, serialized, "utf8");
}

function cacheKeyFromInput(input: { title: string }): string {
  return input.title.trim().toLowerCase();
}

export const tasklistRouter = createTRPCRouter({
  ensure: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        one_pager: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
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

        cache[key] = markdown;
        await writeCache(cache);

        return { cached: false } as const;
      } catch (error) {
        console.error("Tasklist ensure cache failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to ensure cache",
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
  generate: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        one_pager: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const key = cacheKeyFromInput(input);
        const cache = await readCache();
        const cachedMarkdown = cache[key];
        if (cachedMarkdown && typeof cachedMarkdown === "string" && cachedMarkdown.trim()) {
          return { markdown: cachedMarkdown } as const;
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

        cache[key] = markdown;
        await writeCache(cache);

        return { markdown } as const;
      } catch (error) {
        console.error("Tasklist generation failed", error);

        const message =
          error instanceof Error && error.message.includes("OPENAI_API_KEY")
            ? "OpenAI API key is not configured. Set OPENAI_API_KEY in your environment."
            : error instanceof Error
            ? error.message
            : "Failed to generate task list";

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
});
