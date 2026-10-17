import { memo, useState } from "react";
import type React from "react";
import { Layers } from "lucide-react";
import type { MessagePart, ToolCallPart } from "@/lib/store/session/types";
import { Renderer } from "./renderer";
import { ToolCallRow } from "./tool-call";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { splitMarkdownBlocks } from "@/lib/ai/stream/split-blocks";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

// Renders streaming markdown one top-level block at a time so completed blocks
// are parsed once (and skipped by Renderer's memo) while only the trailing
// block re-parses as tokens arrive.
const StreamingMarkdown: React.FC<{ content: string }> = memo(({ content }) => {
  const { completed, tail } = splitMarkdownBlocks(content);

  return (
    <>
      {completed.map((block, index) => (
        <Renderer key={index} content={block} />
      ))}
      {tail && <Renderer key="tail" content={tail} streaming />}
    </>
  );
});
StreamingMarkdown.displayName = "StreamingMarkdown";

const summaryOf = (input: unknown): string | null => {
  if (input && typeof input === "object" && "summary" in input) {
    const summary = (input as { summary?: unknown }).summary;
    if (typeof summary === "string" && summary.trim()) return summary;
  }
  return null;
};

const DoneSummary: React.FC<{ input: unknown }> = ({ input }) => {
  const summary = summaryOf(input);
  if (!summary) return null;
  return (
    <div className="opacity-90">
      <Renderer content={summary} />
    </div>
  );
};

const runStatus = (run: ToolCallPart[]): "running" | "error" | undefined => {
  if (run.some((part) => part.state === "executing")) return "running";
  if (run.some((part) => part.state === "error")) return "error";
  return undefined;
};

const runLabel = (run: ToolCallPart[]): string => {
  const running = run.filter((part) => part.state === "executing").length;
  if (running > 0) return `Running ${running} of ${run.length} tools…`;
  return `Used ${run.length} tools`;
};

// A run of more than one call collapses under a summary row, so consecutive
// calls read as one unit instead of a stack of look-alike rows.
const ToolGroup: React.FC<{ run: ToolCallPart[] }> = ({ run }) => {
  const [open, setOpen] = useState(false);
  const isOpen = open;

  return (
    <Trace>
      <TraceCollapsible open={isOpen} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={runStatus(run)}>
            <TraceIcon>
              <Layers />
            </TraceIcon>
            <TraceTitle className="text-[13px]">{runLabel(run)}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>

        <TraceCollapsibleContent>
          <Trace className="gap-1">
            {run.map((part) => (
              <ToolCallRow key={part.id} block={part} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
};

interface Props {
  parts: MessagePart[];
  streaming?: boolean;
}

export const MessageParts: React.FC<Props> = ({ parts, streaming }) => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);
  const groupToolCalls = useSettingsStore((state) => state.groupToolCalls);

  if (parts.length === 0) return null;

  const lastIndex = parts.length - 1;
  const nodes: React.ReactNode[] = [];
  let run: ToolCallPart[] = [];

  // One block per run of consecutive tool calls: flat rows, or (when the
  // "Group tool calls" setting is on) a summary row that expands into the
  // group. Text and the done-tool markdown break the run.
  const flush = () => {
    if (run.length === 0) return;
    if (!groupToolCalls || run.length === 1) {
      run.forEach((part) => {
        nodes.push(<ToolCallRow key={part.id} block={part} />);
      });
    } else {
      nodes.push(<ToolGroup key={`tools-${run[0].id}`} run={run} />);
    }
    run = [];
  };

  // A call waiting on approval or a question renders nothing yet; skip it
  // without breaking the run so the surrounding calls stay grouped.
  const isHidden = (part: ToolCallPart) => {
    const hasOutcome = part.state === "result" || part.state === "error";
    if (hasOutcome) return false;
    return Boolean(approvals[part.id] || questions[part.id]);
  };

  parts.forEach((part, index) => {
    if (part.type === "text") {
      if (!part.text.trim()) return;
      flush();
      nodes.push(
        <div key={`text-${index}`} className="opacity-90">
          {streaming && index === lastIndex ? (
            <StreamingMarkdown content={part.text} />
          ) : (
            <Renderer content={part.text} />
          )}
        </div>,
      );
      return;
    }

    if (part.toolName === DONE_TOOL_NAME) {
      if (!summaryOf(part.input)) return;
      flush();
      nodes.push(<DoneSummary key={`done-${part.id}`} input={part.input} />);
      return;
    }

    if (isHidden(part)) return;

    run.push(part);
  });

  flush();

  return <div className="space-y-2">{nodes}</div>;
};
