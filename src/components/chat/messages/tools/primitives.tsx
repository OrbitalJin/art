import { Fragment, useState, type FC, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { asRecord, blockErrorOf, formatCount, formatValue } from "./helpers";

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

/* Basics */

export const Chip: FC<{
  children: ReactNode;
  mono?: boolean;
  title?: string;
}> = ({ children, mono, title }) => (
  <span
    title={title}
    className={cn(
      "inline-flex max-w-full min-w-0 items-center rounded-md bg-muted/50 px-1.5 py-0.5",
      "text-[11px] leading-none text-foreground/70",
      mono && "font-mono",
    )}
  >
    <span className="truncate">{children}</span>
  </span>
);

export const SectionLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-medium text-muted-foreground/60 select-none">
    {children}
  </span>
);

export const EmptyNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-[11px] text-muted-foreground/50">{children}</p>
);

export const ErrorNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="rounded-md bg-red-500/5 px-2.5 py-2 text-[11px] leading-snug break-words text-red-600/90 dark:text-red-400/90">
    {children}
  </p>
);

export const SuccessNote: FC<{ label?: string }> = ({
  label = "Completed",
}) => (
  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <span aria-hidden className="size-1.5 rounded-full bg-emerald-500/70" />
    {label}
  </span>
);

export const DoneNote: FC<{ block: ToolCallBlock; label?: string }> = ({
  block,
  label,
}) => (block.state === "result" ? <SuccessNote label={label} /> : null);

export const MetaLine: FC<{
  items: (ReactNode | null | undefined | false)[];
}> = ({ items }) => {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground/60">
      {visible.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span aria-hidden className="text-muted-foreground/30">
              ·
            </span>
          )}
          <span>{item}</span>
        </Fragment>
      ))}
    </p>
  );
};

export const KeyValueList: FC<{
  entries: { label: string; value: ReactNode }[];
}> = ({ entries }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px]">
    {entries.map((entry) => (
      <Fragment key={entry.label}>
        <dt className="text-muted-foreground/60">{entry.label}</dt>
        <dd className="min-w-0 break-words text-foreground/80">
          {entry.value}
        </dd>
      </Fragment>
    ))}
  </dl>
);

/* Lists */

export const RowList: FC<{
  children: ReactNode;
  maxHeightClass?: string;
}> = ({ children, maxHeightClass }) => (
  <ul
    className={cn(
      "flex flex-col divide-y divide-border/40 overflow-auto scroll-fade-y",
      maxHeightClass,
    )}
  >
    {children}
  </ul>
);

export const ListRow: FC<{ children: ReactNode }> = ({ children }) => (
  <li className="flex min-w-0 flex-col gap-1 py-2 first:pt-0 last:pb-0">
    {children}
  </li>
);

export const DateStamp: FC<{
  value: string | null;
  href?: string | null;
}> = ({ value, href }) => {
  if (!value) return null;

  const classes =
    "ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          classes,
          "outline-none hover:text-primary hover:underline focus-visible:underline",
        )}
      >
        {value}
      </a>
    );
  }

  return <span className={classes}>{value}</span>;
};

/* Detail */

export const DetailGate: FC<{
  block: ToolCallBlock;
  executingLabel?: string;
  children: ReactNode;
}> = ({ block, executingLabel = "Loading…", children }) => {
  const error = blockErrorOf(block);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") {
    return <EmptyNote>{executingLabel}</EmptyNote>;
  }

  return <>{children}</>;
};

export const DetailTitle: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <span
      className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
      title={title}
    >
      {title}
    </span>
    {children}
  </div>
);

export const DetailSubtitle: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="truncate text-[10px] text-muted-foreground/50">{children}</p>
);

export const HeaderLine: FC<{
  label: string;
  mono?: boolean;
  children: ReactNode;
}> = ({ label, mono, children }) => (
  <div className="flex min-w-0 items-baseline gap-2">
    <span className="w-14 shrink-0 text-[10px] text-muted-foreground/50">
      {label}
    </span>
    <span
      className={cn(
        "min-w-0 break-words text-[11px] text-foreground/70",
        mono && "font-mono text-[10px]",
      )}
    >
      {children}
    </span>
  </div>
);

/* JSON */

const JsonNode: FC<{ value: unknown; depth: number }> = ({ value, depth }) => {
  const [open, setOpen] = useState(depth < 1);
  const record = asRecord(value);
  const array = Array.isArray(value) ? value : null;

  if (record || array) {
    const entries: [string, unknown][] = record
      ? Object.entries(record)
      : (array ?? []).map((item, index) => [String(index), item]);

    if (entries.length === 0) {
      return (
        <span className="text-muted-foreground/50">{record ? "{}" : "[]"}</span>
      );
    }

    const summary = record
      ? formatCount(entries.length, "key")
      : formatCount(entries.length, "item");

    return (
      <div className="flex min-w-0 flex-col">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "inline-flex w-fit cursor-pointer items-center gap-1 rounded-sm text-muted-foreground/60",
            "outline-none transition-colors hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
        >
          <ChevronRight
            size={11}
            aria-hidden
            className={cn("transition-transform", open && "rotate-90")}
          />
          <span>{summary}</span>
        </button>

        {open && (
          <div className="mt-1 ml-1.5 flex flex-col gap-1 border-l border-border/40 pl-2.5">
            {entries.map(([key, item]) => (
              <div key={key} className="flex min-w-0 gap-1.5">
                <span className="shrink-0 text-muted-foreground/50">
                  {key}:
                </span>
                <JsonNode value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/40">null</span>;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return (
      <span className="text-sky-600/80 dark:text-sky-400/80">
        {String(value)}
      </span>
    );
  }

  const text = formatValue(value);
  const shown = text.length > 2000 ? `${text.slice(0, 2000)}…` : text;

  return (
    <span className="min-w-0 break-words whitespace-pre-wrap text-foreground/75">
      {shown}
    </span>
  );
};

export const JsonTree: FC<{ value: unknown }> = ({ value }) => (
  <div className="font-mono text-[11px] leading-relaxed">
    <JsonNode value={value} depth={0} />
  </div>
);

/* Code and diff */

const DiffLines: FC<{ text: string; sign: "+" | "-"; className?: string }> = ({
  text,
  sign,
  className,
}) => {
  const added = sign === "+";

  const blockClasses = cn(
    "py-1.5",
    added ? "bg-emerald-500/5" : "bg-red-500/5",
    className,
  );

  const signClasses = cn(
    "w-3 shrink-0 text-center select-none",
    added ? "text-emerald-600/70" : "text-red-600/70",
  );

  const lineClasses = cn(
    "min-w-0 break-words whitespace-pre-wrap",
    added
      ? "text-emerald-700/90 dark:text-emerald-400/90"
      : "text-red-700/90 dark:text-red-400/90",
  );

  return (
    <div className={blockClasses}>
      {text.split("\n").map((line, index) => (
        <div key={index} className="flex gap-1.5 px-2">
          <span aria-hidden className={signClasses}>
            {sign}
          </span>
          <span className={lineClasses}>{line || " "}</span>
        </div>
      ))}
    </div>
  );
};

export const DiffPanel: FC<{
  removed?: string | null;
  added?: string | null;
}> = ({ removed, added }) => (
  <div className="max-h-60 overflow-auto rounded-md border border-border/40 font-mono text-[11px] leading-relaxed">
    {removed ? <DiffLines text={removed} sign="-" /> : null}
    {added ? (
      <DiffLines
        text={added}
        sign="+"
        className={removed ? "border-t border-border/40" : undefined}
      />
    ) : null}
  </div>
);

export const CodePanel: FC<{
  children: ReactNode;
  maxHeightClass?: string;
  tone?: "default" | "error" | "added";
}> = ({ children, maxHeightClass = "max-h-40", tone = "default" }) => (
  <pre
    className={cn(
      "overflow-auto rounded-md p-2.5 font-mono text-[11px] leading-relaxed",
      "break-words whitespace-pre-wrap",
      maxHeightClass,
      tone === "default" && "bg-muted/30 text-foreground/70",
      tone === "error" && "bg-red-500/5 text-red-600/90 dark:text-red-400/90",
      tone === "added" &&
        "bg-emerald-500/5 text-emerald-700/90 dark:text-emerald-400/90",
    )}
  >
    {children}
  </pre>
);
