"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

import { Spinner } from "@/components/atoms/Spinner";

type ButtonSize = "md" | "lg";
type ButtonVariant = "primary" | "outline";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
  outline:
    "border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = "md",
      loading = false,
      fullWidth = false,
      variant = "primary",
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled ?? loading;

    return (
      <button
        ref={ref}
        className={clsx(
          "relative inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:outline-neutral-100",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && "w-full",
          loading && "text-transparent",
          className,
        )}
        disabled={isDisabled}
        data-loading={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="absolute inset-y-0 left-4 flex items-center">
            <Spinner className="h-4 w-4 text-white dark:text-neutral-900" />
          </span>
        )}
        <span
          className={clsx("flex items-center gap-2", loading && "opacity-0")}
        >
          {children}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";
