import { useState, type FC } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount, formatValue } from "./format";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

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
