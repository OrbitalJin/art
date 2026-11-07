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
  reasoning: string;
  status: "streaming" | "done";
}

// One calm, stable label per thought. Tracking the model's latest sentence made
// the title churn on every token, which read as visual noise.
const THINKING_WORDS = [
  "Thinking",
  "Pondering",
  "Contemplating",
  "Musing",
  "Deliberating",
  "Cogitating",
  "Ruminating",
  "Mulling",
  "Considering",
  "Reflecting",
];

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  reasoning,
  status,
}) => {
  const [open, setOpen] = useState(false);
  const [thinkingWord] = useState(
    () => THINKING_WORDS[Math.floor(Math.random() * THINKING_WORDS.length)],
  );
  const isStreaming = status === "streaming";

  return (
    <Trace className="mb-2 gap-0">
      <TraceCollapsible open={open} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger className="w-full">
          <TraceLine status={isStreaming ? "running" : undefined}>
            <TraceTitle className="text-[13px]">
              {isStreaming ? thinkingWord : "Reasoning"}
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
