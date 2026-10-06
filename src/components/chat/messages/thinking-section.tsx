import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface ThinkingSectionProps {
  reasoning?: string | null;
  status: "streaming" | "done";
}

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  reasoning,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isStreaming = status === "streaming";

  const hasReasoning = !!reasoning;

  if (isStreaming && !hasReasoning) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner className="animate-spin" />
        <p className="shimmer text-sm">Pondering</p>
      </div>
    );
  }

  if (!hasReasoning) return null;

  return (
    <div className="mb-2 select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 text-muted-foreground",
          "rounded-sm transition-colors duration-150",
          "hover:text-primary",
        )}
      >
        {isStreaming && <Spinner className="animate-spin" />}
        <p className="shimmer text-sm">
          {isStreaming ? "Pondering" : "Introspection"}
        </p>

        <ChevronRight
          size={13}
          className={cn(
            "text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground/60 italic whitespace-pre-wrap">
            {reasoning}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-amber-600/60 align-middle" />
            )}
          </p>
        </div>
      )}
    </div>
  );
};
