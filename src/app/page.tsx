"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Spinner } from "@/components/atoms/Spinner";
import { IdeaDetails } from "@/components/organisms/IdeaDetails";
import { IdeaSlotMachine } from "@/components/organisms/IdeaSlotMachine";
import { TasklistPanel } from "@/components/organisms/TasklistPanel";
import { ideas } from "@/data/ideas";
import type { Idea } from "@/types/idea";
import { api } from "@/lib/trpc/react";

type AppState =
  | "idle"
  | "spinning"
  | "chosen"
  | "generating"
  | "ready"
  | "error";

const selectIdea = () => {
  const index = Math.floor(Math.random() * ideas.length);
  return ideas[index];
};

export default function Page() {
  const [state, setState] = useState<AppState>("idle");
  const [chosenIdea, setChosenIdea] = useState<Idea | null>(null);
  const [tasklist, setTasklist] = useState<string>("");

  const utils = api.useUtils();
  const ensureCache = api.tasklist.ensure.useMutation({
    onError: (error) => {
      console.error("Tasklist prefetch failed", error);
    },
  });
  const generateTasklist = api.tasklist.generate.useMutation({
    onMutate: () => {
      setState("generating");
      toast.info("Generating task list...");
    },
    onSuccess: (data) => {
      setTasklist(data.markdown);
      setState("ready");
      toast.dismiss();
      toast.success("Task list ready");
    },
    onError: (error) => {
      console.error("Tasklist generation failed", error);
      toast.dismiss();
      toast.error("Failed to generate task list");
      setState("error");
    },
    onSettled: () => {
      utils.tasklist.invalidate();
    },
  });

  const reset = () => {
    setState("idle");
    setChosenIdea(null);
    setTasklist("");
  };

  const handleSpin = () => {
    setState("spinning");
  };

  const handleDone = (idea: Idea) => {
    setChosenIdea(idea);
    setState("chosen");
    // Prime cache in the background so Generate is instant if possible
    ensureCache.mutate(idea);
  };

  const handleGenerate = () => {
    if (!chosenIdea) return;
    generateTasklist.mutate(chosenIdea);
  };

  const fastMode =
    typeof window !== "undefined" && window.location.search.includes("fast=1");
  const slotDuration = useMemo(() => (fastMode ? 1500 : 3000), [fastMode]);

  const primaryButtonLabel = (() => {
    if (state === "spinning") return "Spinning...";
    if (state === "generating") return "Generating...";
    if (state === "ready") return "Generate again";
    if (state === "chosen") return "Create AI Agent Tasklist";
    return "Pick a Random Startup Idea";
  })();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
          AI Task-List Creator
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Spin for a random startup idea, generate an atomic design task list,
          and copy it for your next build session.
        </p>
      </header>

      <section className="space-y-4">
        <Button
          size="lg"
          fullWidth
          onClick={state === "idle" ? handleSpin : handleGenerate}
          disabled={state === "spinning" || state === "generating"}
          loading={state === "spinning" || state === "generating"}
        >
          {primaryButtonLabel}
        </Button>

        {state !== "idle" && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-neutral-500 underline-offset-4 transition hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Pick another idea
          </button>
        )}
      </section>

      {state === "spinning" && (
        <IdeaSlotMachine
          ideas={ideas}
          durationMs={slotDuration}
          onDone={handleDone}
        />
      )}

      {(state === "chosen" || state === "generating" || state === "ready") &&
        chosenIdea && (
          <section className="space-y-6">
            <IdeaDetails idea={chosenIdea} />

            {state === "generating" && (
              <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <Spinner size="md" /> Generating task list with GPT-5...
              </div>
            )}

            {state === "ready" && (
              <TasklistPanel
                markdown={tasklist}
                onCopy={() => toast.success("Task list copied")}
                onRegenerate={handleGenerate}
              />
            )}
          </section>
        )}

      {state === "error" && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm">
            We couldn&apos;t generate the task list. Please try again or pick
            another idea.
          </p>
          <div className="mt-4 flex gap-3">
            <Button size="md" onClick={handleGenerate}>
              Retry generation
            </Button>
            <Button size="md" variant="outline" onClick={reset}>
              Pick new idea
            </Button>
          </div>
        </Card>
      )}
    </main>
  );
}
