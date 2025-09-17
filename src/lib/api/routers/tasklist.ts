import { z } from "zod";

import { buildPrompt } from "@/lib/ai/prompt";
import { getOpenAI } from "@/lib/ai/openai";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  ensureTasklistCached,
  generateTasklistWithCache,
} from "@/lib/cache";

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
        const result = await ensureTasklistCached(input);
        return { cached: result.cached } as const;
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
        const markdown = await generateTasklistWithCache(input);
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
