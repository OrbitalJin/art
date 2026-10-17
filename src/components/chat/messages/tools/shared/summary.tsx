import { type FC, type ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { blockErrorOf, formatCount } from "./format";

/* Summary */

export const SummaryRow: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="flex min-w-0 items-center gap-2">{children}</span>
);

export const SummaryText: FC<{
  children: ReactNode;
  mono?: boolean;
  title?: string;
}> = ({ children, mono, title }) => (
  <span
    title={title}
    className={cn(
      "min-w-0 truncate text-xs text-foreground/70",
      mono && "font-mono text-[11px]",
    )}
  >
    {children}
  </span>
);

export const Arrow: FC = () => (
  <span aria-hidden className="shrink-0 text-xs text-muted-foreground/40">
    →
  </span>
);

export const ResultBadge: FC<{
  children: ReactNode;
  tone?: "default" | "success" | "error";
  title?: string;
}> = ({ children, tone = "default", title }) => (
  <span
    title={title ?? (typeof children === "string" ? children : undefined)}
    className={cn(
      "max-w-40 shrink-0 truncate text-[11px] tabular-nums",
      tone === "default" && "text-muted-foreground/60",
      tone === "success" && "text-emerald-600/90 dark:text-emerald-400/90",
      tone === "error" && "text-red-600/90 dark:text-red-400/90",
    )}
  >
    {children}
  </span>
);

/**
 * Trailing status for a summary: `failed` on error, nothing while executing,
 * otherwise the children.
 */
export const SummaryStatus: FC<{
  block: ToolCallBlock;
  children: ReactNode;
}> = ({ block, children }) => {
  const failed = block.state === "error" || blockErrorOf(block) !== null;
  if (failed) return <ResultBadge tone="error">failed</ResultBadge>;

  if (block.state === "executing") return null;

  return <>{children}</>;
};

export const CountSummary: FC<{
  block: ToolCallBlock;
  label: string | null;
  count: number;
  noun: string;
}> = ({ block, label, count, noun }) => (
  <SummaryRow>
    {label ? <SummaryText title={label}>{label}</SummaryText> : null}
    <SummaryStatus block={block}>
      <ResultBadge>{formatCount(count, noun)}</ResultBadge>
    </SummaryStatus>
  </SummaryRow>
);
