import { forwardRef } from "react";
import { clsx } from "clsx";

type CardTone = "default" | "inverted";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const toneStyles: Record<CardTone, string> = {
  default:
    "border-neutral-200 bg-white text-neutral-900 shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
  inverted:
    "border-neutral-800 bg-neutral-950 text-neutral-50 shadow-neutral-950/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-2xl border p-6 transition",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = "Card";

