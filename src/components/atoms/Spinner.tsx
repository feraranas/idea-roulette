"use client";

import { clsx } from "clsx";

type SpinnerSize = "sm" | "md";

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize;
  label?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

export const Spinner = ({
  size = "sm",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) => (
  <span
    role="status"
    aria-live="polite"
    className={clsx("inline-flex items-center", className)}
    {...props}
  >
    <svg
      className={clsx(
        "motion-safe:animate-spin motion-reduce:animate-none text-current",
        sizeClasses[size],
      )}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span className="sr-only">{label}</span>
  </span>
);

