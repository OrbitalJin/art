import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

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

const ThinkingLabel: React.FC<{ title: string; isStreaming: boolean }> = ({
  title,
  isStreaming,
}) => {
  const titleClasses = cn("text-[13px]", isStreaming && "shimmer");

  return (
    <>
      {isStreaming && (
        <Spinner className="size-3.5 shrink-0 animate-spin text-amber-500" />
      )}
      <span className={titleClasses}>{title}</span>
    </>
  );
};

const ReasoningText: React.FC<{
  reasoning: string;
  isStreaming: boolean;
}> = ({ reasoning, isStreaming }) => (
  <div className="max-h-64 overflow-auto pr-1">
    <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-muted-foreground/80">
      {reasoning}
      {isStreaming && <StreamingCursor />}
    </p>
  </div>
);

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  reasoning,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isStreaming = status === "streaming";
  const hasReasoning = !!reasoning;

  if (isStreaming && !hasReasoning) {
    return (
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        <ThinkingLabel title="Thinking…" isStreaming />
      </div>
    );
  }

  if (!hasReasoning) return null;

  const title = isStreaming ? "Thinking…" : "Thought process";

  const headerClasses = cn(
    "inline-flex cursor-pointer items-center gap-1.5 rounded-sm",
    "text-left text-muted-foreground select-none outline-none",
    "transition-colors duration-150 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const chevronClasses = cn(
    "shrink-0 text-muted-foreground/50 transition-transform duration-200",
    "motion-reduce:transition-none",
    isOpen && "rotate-90",
  );

  const bodyClasses = cn(
    "mt-1.5 ml-1 border-l border-border/60 pl-3",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
  );

  return (
    <div className="mb-2 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={headerClasses}
      >
        <ThinkingLabel title={title} isStreaming={isStreaming} />
        <ChevronRight size={13} aria-hidden className={chevronClasses} />
      </button>

      {isOpen && (
        <div className={bodyClasses}>
          <ReasoningText reasoning={reasoning} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  );
};
