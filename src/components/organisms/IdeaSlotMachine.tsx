"use client";

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Card } from "@/components/atoms/Card";
import type { Idea } from "@/types/idea";

export type IdeaSlotMachineProps = {
  ideas: Idea[];
  durationMs?: number;
  onDone: (idea: Idea) => void;
};

const ITEM_HEIGHT = 64; // px, matches h-16

export const IdeaSlotMachine = ({
  ideas,
  durationMs = 6500,
  onDone,
}: IdeaSlotMachineProps) => {
  const shouldReduceMotion = useReducedMotion();

  const finalIdea = useMemo(() => {
    if (!ideas.length) {
      throw new Error("IdeaSlotMachine requires at least one idea");
    }
    const index = Math.floor(Math.random() * ideas.length);
    return ideas[index];
  }, [ideas]);

  const sequence = useMemo(() => {
    const loops = shouldReduceMotion ? 1 : 4;
    const rolled: Idea[] = [];
    for (let loop = 0; loop < loops; loop += 1) {
      rolled.push(...ideas);
    }
    rolled.push(finalIdea);
    return rolled;
  }, [finalIdea, ideas, shouldReduceMotion]);

  const targetIndex = sequence.length - 1;
  const duration = shouldReduceMotion
    ? Math.min(Math.max(durationMs, 200), 800)
    : durationMs;

  useEffect(() => {
    const timeout = window.setTimeout(() => onDone(finalIdea), duration);
    return () => window.clearTimeout(timeout);
  }, [duration, finalIdea, onDone]);

  return (
    <Card tone="inverted" className="relative overflow-hidden">
      <div
        className="relative mx-auto flex w-full max-w-xl flex-col items-center"
        style={{ height: ITEM_HEIGHT * 3 }}
        aria-live="polite"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neutral-950 via-neutral-950/60 to-transparent dark:from-neutral-800" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent dark:from-neutral-800" />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -targetIndex * ITEM_HEIGHT }}
          transition={{
            duration: duration / 1000,
            ease: shouldReduceMotion ? "easeOut" : [0.12, 0.49, 0.34, 1],
          }}
          className="w-full"
        >
          {sequence.map((idea, index) => (
            <div
              key={`${idea.title}-${index}`}
              className="flex h-16 items-center justify-center border-b border-white/10 text-lg font-semibold text-neutral-50"
            >
              {idea.title}
            </div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
};

