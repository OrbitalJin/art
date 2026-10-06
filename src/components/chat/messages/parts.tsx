import type React from "react";
import type { MessagePart } from "@/lib/store/session/types";
import { Renderer } from "./renderer";
import { ToolCallCard } from "./tool-call-card";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";

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

        return (
          <div key={part.id} className="space-y-2">
            <ToolCallCard block={part} />
            {part.toolName === DONE_TOOL_NAME && (
              <DoneSummary input={part.input} />
            )}
          </div>
        );
      })}
    </div>
  );
};
