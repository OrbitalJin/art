import { useState } from "react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

interface ThinkingSectionProps {
  reasoning?: string | null;
  status: "streaming" | "done";
}

// Last readable step, whether the model wrote one sentence per line or a
// paragraph.
const currentAction = (reasoning: string): string => {
  const segments = reasoning.split(/\n+|(?<=[.!?])\s+/).filter((s) => s.trim());
  const last = segments[segments.length - 1] ?? "";
  return (
    last
      .replace(/^[\s>*#\d.-]+/, "")
      .replace(/[*_`]/g, "")
      .trim() || "Thinking"
  );
};

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  reasoning,
  status,
}) => {
  const [open, setOpen] = useState(false);
  const isStreaming = status === "streaming";

  if (!reasoning) {
    if (!isStreaming) return null;
    return (
      <Trace className="mb-2 gap-0">
        <TraceLine status="running">
          <TraceTitle className="text-[13px]">Thinking</TraceTitle>
        </TraceLine>
      </Trace>
    );
  }

  return (
    <Trace className="mb-2 gap-0">
      <TraceCollapsible open={open} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger className="w-full">
          <TraceLine status={isStreaming ? "running" : undefined}>
            <TraceTitle className="text-[13px]">
              {isStreaming ? currentAction(reasoning) : "Introspection"}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>

        <TraceCollapsibleContent>
          <div className="max-h-64 overflow-auto pr-1">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-muted-foreground/80">
              {reasoning}
            </p>
          </div>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
};
