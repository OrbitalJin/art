import { useState } from "react";
import { CircleX, LoaderPinwheel } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { resolveRenderer } from "@/components/chat/messages/tools/registry";
import {
  CodePanel,
  SectionLabel,
} from "@/components/chat/messages/tools/shared";
import {
  formatToolName,
  formatValue,
  getSummaryText,
} from "@/components/chat/messages/tools/shared";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

type ToolRendererEntry = ReturnType<typeof resolveRenderer>;

/** Parse a block's output once against its renderer's output schema. */
const outputOf = (
  renderer: ToolRendererEntry,
  block: ToolCallBlock,
): unknown => {
  if (!renderer.outputSchema) return block.output ?? null;
  const parsed = renderer.outputSchema.safeParse(block.output);
  return parsed.success ? parsed.data : null;
};

/** Parse a block's input once against its renderer's input schema. */
const inputOf = (
  renderer: ToolRendererEntry,
  block: ToolCallBlock,
): unknown => {
  if (!renderer.inputSchema) return block.input ?? null;
  const parsed = renderer.inputSchema.safeParse(block.input);
  return parsed.success ? parsed.data : null;
};

const LeadingGlyph: React.FC<{
  state: ToolCallBlock["state"];
  icon: ToolRendererEntry["icon"];
}> = ({ state, icon: Icon }) => {
  if (state === "executing") {
    return (
      <LoaderPinwheel
        strokeWidth={1}
        className="shrink-0 animate-spin motion-reduce:animate-none"
      />
    );
  }

  if (state === "error") {
    return <CircleX strokeWidth={1} className="shrink-0" />;
  }

  return <Icon className="shrink-0" />;
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
  if (Summary)
    return (
      <Summary
        block={block}
        input={inputOf(renderer, block)}
        output={outputOf(renderer, block)}
      />
    );

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
        <Detail
          block={block}
          input={inputOf(renderer, block)}
          output={outputOf(renderer, block)}
        />
      )}
    </div>
  );
};

const TraceRow: React.FC<{
  block: ToolCallBlock;
  renderer: ToolRendererEntry;
  title: string;
  isDone: boolean;
  status: "running" | "error" | undefined;
}> = ({ block, renderer, title, isDone, status }) => (
  <TraceLine status={status}>
    <TraceIcon>
      <LeadingGlyph state={block.state} icon={renderer.icon} />
    </TraceIcon>

    <TraceTitle className="text-[13px]">{title}</TraceTitle>

    {!isDone && <CompactSummary block={block} />}
  </TraceLine>
);

/**
 * One quiet Trace row for a tool call. The surrounding `<Trace>` is owned by
 * `MessageParts`, which groups consecutive calls into a single list.
 */
export const ToolCallRow: React.FC<{ block: ToolCallBlock }> = ({ block }) => {
  const [open, setOpen] = useState(false);

  const renderer = resolveRenderer(block.toolName);

  const isDone = block.toolName === DONE_TOOL_NAME;
  const isExecuting = block.state === "executing";
  const isError = block.state === "error";

  const status: "running" | "error" | undefined = isExecuting
    ? "running"
    : isError
      ? "error"
      : undefined;

  const hasExecutingTitle = isExecuting && !isDone && !!renderer.executingTitle;

  const title = hasExecutingTitle
    ? `${renderer.executingTitle}…`
    : isDone
      ? "Finished"
      : renderer.title || formatToolName(block.toolName);

  const hasDetails = block.input !== undefined || block.output !== undefined;

  // Collapsed until the reader opens it, so streaming never shifts layout.
  const isOpen = open;

  if (!hasDetails) {
    return (
      <TraceRow
        block={block}
        renderer={renderer}
        title={title}
        isDone={isDone}
        status={status}
      />
    );
  }

  return (
    <TraceCollapsible open={isOpen} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>
        <TraceRow
          block={block}
          renderer={renderer}
          title={title}
          isDone={isDone}
          status={status}
        />
      </TraceCollapsibleTrigger>

      <TraceCollapsibleContent>
        <DetailBody block={block} renderer={renderer} />
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
};
