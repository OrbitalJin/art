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

const StreamingCursor: React.FC = () => (
  <span
    aria-hidden
    className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-amber-500/70 align-middle motion-reduce:animate-none"
  />
);

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  reasoning,
  status,
}) => {
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  const isStreaming = status === "streaming";
  const hasReasoning = !!reasoning;

  // While reasoning streams, the row opens itself; once the reader clicks,
  // their choice wins.
  const isOpen = open ?? isStreaming;

  if (isStreaming && !hasReasoning) {
    return (
      <Trace className="mb-2 gap-0">
        <TraceLine status="running">
          <TraceTitle className="text-[13px]">Thinking</TraceTitle>
        </TraceLine>
      </Trace>
    );
  }

  if (!hasReasoning) return null;

  const title = isStreaming ? "Thinking" : "Thought process";

  return (
    <Trace className="mb-2 gap-0">
      <TraceCollapsible open={isOpen} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger className="w-full">
          <TraceLine status={isStreaming ? "running" : undefined}>
            <TraceTitle className="text-[13px]">{title}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>

        <TraceCollapsibleContent>
          <div className="max-h-64 overflow-auto pr-1">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-muted-foreground/80">
              {reasoning}
              {isStreaming && <StreamingCursor />}
            </p>
          </div>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
};
