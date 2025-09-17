import { z } from "zod";

import { buildPrompt } from "@/lib/ai/prompt";
import { getOpenAI } from "@/lib/ai/openai";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";

export const tasklistRouter = createTRPCRouter({
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

        return { markdown };
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
