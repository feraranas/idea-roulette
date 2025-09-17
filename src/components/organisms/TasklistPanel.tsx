"use client";

import { Card } from "@/components/atoms/Card";
import { CopyButton } from "@/components/atoms/CopyButton";
import { MarkdownRenderer } from "@/components/atoms/MarkdownRenderer";

export type TasklistPanelProps = {
  markdown: string;
  onCopy: () => void;
  onRegenerate?: () => void;
};

export const TasklistPanel = ({ markdown, onCopy, onRegenerate }: TasklistPanelProps) => {
  return (
    <Card className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            AI Agent Tasklist
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Review, copy, and share the generated checklist.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Regenerate
            </button>
          )}
          <CopyButton size="md" getText={() => markdown} onCopied={onCopy} disabled={!markdown}>
            Copy
          </CopyButton>
        </div>
      </header>
      <section
        className="max-h-[60vh] overflow-auto rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm leading-relaxed dark:border-neutral-800 dark:bg-neutral-900"
        aria-live="polite"
      >
        {markdown ? (
          <MarkdownRenderer markdown={markdown} className="prose-sm" />
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400">
            Tasklist will appear here once generated.
          </p>
        )}
      </section>
    </Card>
  );
};

