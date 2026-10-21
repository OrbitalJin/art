import { useState } from "react";
import { CircleX, LoaderPinwheel } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { resolveTool, type ResolvedTool } from "@/components/chat/messages/tools/registry";
import { formatToolName, getSummaryText } from "@/components/chat/messages/tools/shared";
import { surfaceTitle, toolStatus } from "@/components/chat/messages/tools/presentation";
import { RawToolBody } from "@/components/chat/messages/tools/renderers/generic";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

const LeadingGlyph: React.FC<{
  state: ToolCallBlock["state"];
  icon: LucideIcon;
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

const ResolvedSummary: React.FC<{ resolved: ResolvedTool }> = ({
  resolved,
}) => {
  const { entry, block, input, output } = resolved;
  if (block.state === "executing") return null;

  const Summary = entry.Summary;
  if (Summary) return <Summary block={block} input={input} output={output} />;

  const summaryText = getSummaryText(block.input);
  if (!summaryText) return null;

  return (
    <span className="min-w-0 truncate text-xs text-muted-foreground/70">
      {summaryText}
    </span>
  );
};

/** Resolve a block's renderer once and render its compact summary. */
export const CompactSummary: React.FC<{ block: ToolCallBlock }> = ({
  block,
}) => <ResolvedSummary resolved={resolveTool(block)} />;

const DetailBody: React.FC<{ resolved: ResolvedTool }> = ({ resolved }) => {
  const { entry, block, input, output } = resolved;
  const Detail = entry.Detail;
  const isError = block.state === "error";

  return (
    <div className="flex flex-col gap-2">
      {isError || !Detail ? (
        <RawToolBody block={block} />
      ) : (
        <Detail block={block} input={input} output={output} />
      )}
    </div>
  );
};

const TraceRow: React.FC<{
  resolved: ResolvedTool;
  title: string;
  isDone: boolean;
}> = ({ resolved, title, isDone }) => {
  const { entry, block } = resolved;

  return (
    <TraceLine status={toolStatus(block.state)}>
      <TraceIcon>
        <LeadingGlyph state={block.state} icon={entry.icon} />
      </TraceIcon>

      <TraceTitle className="text-[13px]">{title}</TraceTitle>

      {!isDone && <ResolvedSummary resolved={resolved} />}
    </TraceLine>
  );
};

const titleOf = (resolved: ResolvedTool): string => {
  const { entry, block } = resolved;
  if (block.toolName === DONE_TOOL_NAME) return "Finished";
  return surfaceTitle(block, entry) || formatToolName(block.toolName);
};

/**
 * One quiet Trace row for a tool call. The surrounding `<Trace>` is owned by
 * `MessageParts`, which groups consecutive calls into a single list.
 */
export const ToolCallRow: React.FC<{ resolved: ResolvedTool }> = ({
  resolved,
}) => {
  const [open, setOpen] = useState(false);
  const { block } = resolved;

  const isDone = block.toolName === DONE_TOOL_NAME;
  const hasDetails = block.input !== undefined || block.output !== undefined;

  if (!hasDetails) {
    return (
      <TraceRow resolved={resolved} title={titleOf(resolved)} isDone={isDone} />
    );
  }

  return (
    <TraceCollapsible open={open} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>
        <TraceRow
          resolved={resolved}
          title={titleOf(resolved)}
          isDone={isDone}
        />
      </TraceCollapsibleTrigger>

      <TraceCollapsibleContent>
        <DetailBody resolved={resolved} />
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
};
