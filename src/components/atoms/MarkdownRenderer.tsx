"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";
import type { Components } from "react-markdown";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

const headingClassName = "font-semibold text-neutral-900 dark:text-neutral-50";

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  children?: ReactNode;
};

const Code = ({ className, children, inline, ...props }: CodeProps) => (
  <code
    className={clsx(
      "rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.875rem] dark:bg-neutral-800",
      inline ? undefined : "block whitespace-pre-wrap p-4",
      className,
    )}
    {...props}
  >
    {children}
  </code>
);

const components: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={clsx("text-2xl", headingClassName, className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={clsx("text-xl", headingClassName, className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={clsx("text-lg", headingClassName, className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={clsx("text-base", headingClassName, className)} {...props} />
  ),
  code: Code,
  a: ({ className, ...props }) => (
    <a
      className={clsx(
        "font-medium text-blue-600 underline decoration-blue-400 decoration-2 underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200",
        className,
      )}
      {...props}
    />
  ),
};

export const MarkdownRenderer = ({ markdown, className }: MarkdownRendererProps) => {
  return (
    <div className={clsx("prose prose-neutral dark:prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

