import { useState } from "react";
import {
  ChevronRight,
  CircleCheck,
  CircleX,
  LoaderPinwheel,
} from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";

type ToolState = "executing" | "result" | "error";

interface Props {
  block: ToolCallBlock;
  className?: string;
  variant?: "default" | "compact";
}

const formatValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

const StatusGlyph: React.FC<{ state: ToolState }> = ({ state }) => {
  if (state === "executing") {
    return (
      <LoaderPinwheel
        size={13}
        aria-hidden
        className="shrink-0 animate-spin text-amber-600"
      />
    );
  }

  if (state === "error") {
    return <CircleX size={13} aria-hidden className="shrink-0 text-red-500" />;
  }

  return (
    <CircleCheck size={13} aria-hidden className="shrink-0 text-emerald-500" />
  );
};

export const ToolCallCard: React.FC<Props> = ({
  className,
  block,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDone = block.toolName === DONE_TOOL_NAME;
  const isExecuting = block.state === "executing";
  const isError = block.state === "error";
  const compact = variant === "compact";

  const input = formatValue(block.input);
  const output = block.output !== undefined ? formatValue(block.output) : null;

  return (
    <div className={cn("min-w-0 ", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 select-none",
          "rounded-md px-1.5 py-1 text-foreground/85 outline-none",
          "transition-colors duration-150 hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          !compact && "-ml-1.5",
          compact && "py-0.5",
        )}
      >
        <StatusGlyph state={block.state} />

        <span className="shrink-0 font-mono text-xs font-medium">
          {block.toolName}
        </span>

        {!isDone && <CompactSummary block={block} />}

        <ChevronRight
          size={13}
          aria-hidden
          className={cn(
            "ml-auto shrink-0 text-muted-foreground/50 transition-transform duration-200",
            "motion-reduce:transition-none",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "flex gap-2 pt-1.5 pb-0.5 pl-1.5",
            "animate-in fade-in duration-150 motion-reduce:animate-none",
            !compact && "-ml-1.5",
          )}
        >
          <div aria-hidden className="relative w-[13px] shrink-0">
            <span
              className={cn(
                "absolute -top-2 bottom-1 left-1/2 w-px -translate-x-1/2",
                isExecuting
                  ? "bg-amber-500/40"
                  : isError
                    ? "bg-red-500/40"
                    : "bg-border",
              )}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {input && (
              <Field label="Parameters">
                <pre className="max-h-24 overflow-auto rounded-md border border-border/40 bg-muted/30 p-2 font-mono text-xs leading-relaxed text-foreground/75">
                  {input}
                </pre>
              </Field>
            )}

            {output !== null && (
              <Field label={isError ? "Error" : "Result"}>
                <pre
                  className={cn(
                    "max-h-36 overflow-auto rounded-md border border-border/40 bg-muted/30 p-2 font-mono text-xs leading-relaxed",
                    isError ? "text-red-500/90" : "text-foreground/75",
                  )}
                >
                  {output}
                </pre>
              </Field>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CompactSummary: React.FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  if (block.state === "executing") return null;

  const input = block.input;
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const key of ["summary", "query", "path", "url", "title", "name"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return (
          <span className="min-w-0 truncate text-xs text-muted-foreground/70">
            {value}
          </span>
        );
      }
    }
  }

  return null;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <span className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground/45 select-none">
      {label}
    </span>
    {children}
  </div>
);
