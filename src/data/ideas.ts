import rawIdeas from "./ideas.json";
import { z } from "zod";

import type { Idea } from "@/types/idea";

const ideaSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  one_pager: z.string().min(1),
});

const ideasSchema = z.array(ideaSchema).length(20);

export const ideas: Idea[] = ideasSchema.parse(rawIdeas);

export type { Idea };

