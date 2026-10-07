import type React from "react";
import type { MessagePart, ToolCallPart } from "@/lib/store/session/types";
import { Renderer } from "./renderer";
import { ToolCallCard } from "./tool-call-card";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";

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

  return (
    <div className="space-y-2">
      {(!question || hasOutcome) && (!approval || hasOutcome) && (
        <ToolCallCard block={part} />
      )}
      {part.toolName === DONE_TOOL_NAME && <DoneSummary input={part.input} />}
    </div>
  );
};

interface Props {
  parts: MessagePart[];
}

export const MessageParts: React.FC<Props> = ({ parts }) => {
  if (parts.length === 0) return null;

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === "text") {
          if (!part.text.trim()) return null;
          return (
            <div key={`text-${index}`} className="opacity-90">
              <Renderer content={part.text} />
            </div>
          );
        }

        return <ToolCallPartView key={part.id} part={part} />;
      })}
    </div>
  );
};
