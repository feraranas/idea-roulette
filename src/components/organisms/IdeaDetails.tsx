"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Card } from "@/components/atoms/Card";
import { MarkdownRenderer } from "@/components/atoms/MarkdownRenderer";
import type { Idea } from "@/types/idea";

export type IdeaDetailsProps = {
  idea: Idea;
  defaultExpanded?: boolean;
};

export const IdeaDetails = ({ idea, defaultExpanded = false }: IdeaDetailsProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
          {idea.title}
        </h1>
        <MarkdownRenderer markdown={idea.summary} className="prose-sm" />
      </header>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden="true" /> Hide one pager
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden="true" /> View one pager
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <MarkdownRenderer markdown={idea.one_pager} className="prose-sm" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

