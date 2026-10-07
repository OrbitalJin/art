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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const formatValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

export const formatToolName = (name: string): string => {
  const withSpaces = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const getSummaryText = (input: unknown): string | null => {
  if (!isRecord(input)) return null;

  const candidateKeys = ["summary", "query", "path", "url", "title", "name"];

  for (const key of candidateKeys) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

const StatusGlyph: React.FC<{ state: ToolState }> = ({ state }) => {
  if (state === "executing") {
    return (
      <LoaderPinwheel
        size={13}
        aria-hidden
        className="shrink-0 animate-spin text-amber-500 motion-reduce:animate-none"
      />
    );
  }

  if (state === "error") {
    return <CircleX size={13} aria-hidden className="shrink-0 text-red-500" />;
  }

  return (
    <CircleCheck
      size={13}
      aria-hidden
      className="shrink-0 text-emerald-500/70"
    />
  );
};

const CodeBlock: React.FC<{
  children: React.ReactNode;
  maxHeightClass: string;
  isError?: boolean;
}> = ({ children, maxHeightClass, isError = false }) => (
  <pre
    className={cn(
      "overflow-auto rounded-md bg-muted/30 p-2.5 font-mono text-[11px] leading-relaxed",
      maxHeightClass,
      isError ? "text-red-500/80" : "text-foreground/65",
    )}
  >
    {children}
  </pre>
);

const DetailSection: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[11px] font-medium text-muted-foreground/60 select-none">
      {label}
    </span>
    {children}
  </div>
);

export const CompactSummary: React.FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  if (block.state === "executing") return null;

  const summaryText = getSummaryText(block.input);
  if (!summaryText) return null;

  return (
    <span className="min-w-0 truncate text-xs text-muted-foreground/70">
      {summaryText}
    </span>
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

  const title = isDone ? "Finished" : formatToolName(block.toolName);
  const input = formatValue(block.input);
  const output = block.output !== undefined ? formatValue(block.output) : null;
  const hasDetails = Boolean(input) || output !== null;

  const outputLabel = isError ? "Something went wrong" : "Response";

  const containerClasses = cn(
    "min-w-0 transition-colors duration-150",
    !compact && "rounded-lg border bg-muted/10",
    !compact && (isError ? "border-red-500/25" : "border-border/40"),
    !compact && hasDetails && !isOpen && "hover:bg-muted/25",
    className,
  );

  const headerClasses = cn(
    "flex w-full items-center gap-2 text-left select-none outline-none",
    "rounded-lg text-foreground/75 transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    compact ? "px-1.5 py-0.5" : "px-2.5 py-1.5",
    hasDetails ? "cursor-pointer hover:text-foreground" : "cursor-default",
  );

  const titleClasses = cn("shrink-0", compact ? "text-xs" : "text-[13px]");

  const chevronClasses = cn(
    "ml-auto shrink-0 text-muted-foreground/40 transition-transform duration-200",
    "motion-reduce:transition-none",
    isOpen && "rotate-90",
  );

  const detailsClasses = cn(
    "flex flex-col gap-3 border-t border-border/30 px-2.5 py-2.5",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
    compact && "px-1.5",
  );

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        disabled={!hasDetails}
        className={headerClasses}
      >
        <StatusGlyph state={block.state} />

        <span className={titleClasses}>{title}</span>

        {isExecuting && !isDone && (
          <span className="shrink-0 text-xs text-muted-foreground/70 animate-pulse motion-reduce:animate-none">
            Working…
          </span>
        )}

        {!isDone && <CompactSummary block={block} />}

        {hasDetails && (
          <ChevronRight size={13} aria-hidden className={chevronClasses} />
        )}
      </button>

      {isOpen && hasDetails && (
        <div className={detailsClasses}>
          {input && (
            <DetailSection label="Request">
              <CodeBlock maxHeightClass="max-h-28">{input}</CodeBlock>
            </DetailSection>
          )}

          {output !== null && (
            <DetailSection label={outputLabel}>
              <CodeBlock maxHeightClass="max-h-40" isError={isError}>
                {output}
              </CodeBlock>
            </DetailSection>
          )}
        </div>
      )}
    </div>
  );
};
