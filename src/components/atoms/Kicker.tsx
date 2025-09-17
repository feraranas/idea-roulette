import { clsx } from "clsx";

export type KickerProps = React.HTMLAttributes<HTMLParagraphElement>;

export const Kicker = ({ className, ...props }: KickerProps) => (
  <p
    className={clsx(
      "text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400",
      className,
    )}
    {...props}
  />
);

