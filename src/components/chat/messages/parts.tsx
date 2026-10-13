import { memo } from "react";
import type React from "react";
import type { MessagePart, ToolCallPart } from "@/lib/store/session/types";
import { Renderer } from "./renderer";
import { ToolCallCard } from "./tool-call-card";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { splitMarkdownBlocks } from "@/lib/ai/stream/split-blocks";

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

const ToolCallPartView: React.FC<{ part: ToolCallPart }> = ({ part }) => {
  const approval = useApprovalStore((state) => state.pending[part.id]);
  const question = useQuestionStore((state) => state.pending[part.id]);
  const hasOutcome = part.state === "result" || part.state === "error";

  if (part.toolName === DONE_TOOL_NAME) {
    return <DoneSummary input={part.input} />;
  }

  return (
    <div className="space-y-2">
      {(!question || hasOutcome) && (!approval || hasOutcome) && (
        <ToolCallCard block={part} />
      )}
    </div>
  );
};

interface Props {
  parts: MessagePart[];
  streaming?: boolean;
}

export const MessageParts: React.FC<Props> = ({ parts, streaming }) => {
  if (parts.length === 0) return null;

  const lastIndex = parts.length - 1;

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === "text") {
          if (!part.text.trim()) return null;
          return (
            <div key={`text-${index}`} className="opacity-90">
              {streaming && index === lastIndex ? (
                <StreamingMarkdown content={part.text} />
              ) : (
                <Renderer content={part.text} />
              )}
            </div>
          );
        }

        return <ToolCallPartView key={part.id} part={part} />;
      })}
    </div>
  );
};
