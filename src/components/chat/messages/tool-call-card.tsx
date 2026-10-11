import { useState } from "react";
import { ChevronRight, CircleX, LoaderPinwheel } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/names";
import { resolveRenderer } from "@/components/chat/messages/tools/registry";
import {
  CodePanel,
  SectionLabel,
} from "@/components/chat/messages/tools/primitives";
import {
  formatToolName,
  formatValue,
  getSummaryText,
} from "@/components/chat/messages/tools/helpers";

export { formatToolName };

type ToolRendererEntry = ReturnType<typeof resolveRenderer>;

interface Props {
  block: ToolCallBlock;
  className?: string;
  variant?: "default" | "compact";
}

const LeadingGlyph: React.FC<{
  state: ToolCallBlock["state"];
  icon: ToolRendererEntry["icon"];
}> = ({ state, icon: Icon }) => {
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
    <Icon size={13} aria-hidden className="shrink-0 text-muted-foreground/60" />
  );
};

const RawView: React.FC<{ block: ToolCallBlock; isError: boolean }> = ({
  block,
  isError,
}) => {
  const input = formatValue(block.input);
  const output = block.output !== undefined ? formatValue(block.output) : null;
  const outputLabel = isError ? "Something went wrong" : "Response";

  return (
    <div className="flex flex-col gap-3">
      {input && (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Request</SectionLabel>
          <CodePanel maxHeightClass="max-h-28">{input}</CodePanel>
        </div>
      )}

      {output !== null && (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{outputLabel}</SectionLabel>
          <CodePanel
            maxHeightClass="max-h-40"
            tone={isError ? "error" : "default"}
          >
            {output}
          </CodePanel>
        </div>
      )}
    </div>
  );
};

export const CompactSummary: React.FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  if (block.state === "executing") return null;

  const renderer = resolveRenderer(block.toolName);
  const Summary = renderer.Summary;
  if (Summary) return <Summary block={block} />;

  const summaryText = getSummaryText(block.input);
  if (!summaryText) return null;

  return (
    <span className="min-w-0 truncate text-xs text-muted-foreground/70">
      {summaryText}
    </span>
  );
};

const DetailBody: React.FC<{
  block: ToolCallBlock;
  renderer: ToolRendererEntry;
}> = ({ block, renderer }) => {
  const Detail = renderer.Detail;
  const isError = block.state === "error";

  const raw = isError || !Detail;

  return (
    <div className="flex flex-col gap-2">
      {raw || !Detail ? (
        <RawView block={block} isError={isError} />
      ) : (
        <Detail block={block} />
      )}
    </div>
  );
};

export const ToolCallCard: React.FC<Props> = ({
  className,
  block,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderer = resolveRenderer(block.toolName);

  const isDone = block.toolName === DONE_TOOL_NAME;
  const isExecuting = block.state === "executing";
  const isError = block.state === "error";
  const compact = variant === "compact";

  const title = isDone
    ? "Finished"
    : renderer.title || formatToolName(block.toolName);
  const hasDetails = block.input !== undefined || block.output !== undefined;

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
    "border-t border-border/30 px-2.5 py-3",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
    compact && "px-1.5",
  );

  const handleToggleOpen = () => setIsOpen((open) => !open);

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-expanded={isOpen}
        disabled={!hasDetails}
        className={headerClasses}
      >
        <LeadingGlyph state={block.state} icon={renderer.icon} />

        <span className={titleClasses}>{title}</span>

        {isExecuting && !isDone && (
          <span className="shrink-0 animate-pulse text-xs text-muted-foreground/70 motion-reduce:animate-none">
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
          <DetailBody block={block} renderer={renderer} />
        </div>
      )}
    </div>
  );
};
