import { useState } from "react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { Renderer } from "@/components/chat/messages/renderer";
import { useCopy } from "@/hooks/use-copy";
import { MODELS } from "@/lib/ai/models";

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

const StoppedDot: React.FC = () => (
  <span
    aria-hidden
    className="size-1.5 rounded-full bg-destructive/70 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
  />
);

const pillClasses = cn(
  "flex items-center gap-2 rounded-full px-3 py-1",
  "bg-destructive/5 text-xs text-destructive/80 ring-1 ring-destructive/20",
);

export const AbortedMessage: React.FC<Message> = (message) => {
  const { modelId } = message;
  const content = messageText(message);
  const { copied, copy } = useCopy(content);
  const [isOpen, setIsOpen] = useState(false);

  const hasContent = content.trim().length > 0;
  const model = MODELS.find((m) => m.id === modelId);

  if (!hasContent) {
    return (
      <div className="w-full animate-in fade-in duration-100 select-auto">
        <Marker role="status" variant="separator">
          <MarkerContent className={pillClasses}>
            <StoppedDot />
            Stopped by you
          </MarkerContent>
        </Marker>
      </div>
    );
  }

  const words = countWords(content);
  const wordsLabel = `${words} word${words === 1 ? "" : "s"} kept`;

  const toggleClasses = cn(
    pillClasses,
    "cursor-pointer outline-none select-none",
    "transition-colors duration-150 hover:bg-destructive/10",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    isOpen && "bg-destructive/10",
  );

  const chevronClasses = cn(
    "shrink-0 text-destructive/50 transition-transform duration-200",
    "motion-reduce:transition-none",
    isOpen && "rotate-90",
  );

  const bodyClasses = cn(
    "mt-3 ml-3 flex flex-col gap-2 border-l border-destructive/25 pl-4",
    "animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none",
  );

  return (
    <div className="w-full min-w-0 animate-in fade-in duration-100 select-auto scale-95">
      <Marker asChild>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className={toggleClasses}
        >
          <MarkerIcon>
            <StoppedDot />
          </MarkerIcon>
          <MarkerContent>
            Stopped by you
            <span className="text-destructive/50">· {wordsLabel}</span>
          </MarkerContent>
          <ChevronRight size={12} aria-hidden className={chevronClasses} />
        </button>
      </Marker>

      {isOpen && (
        <div className={bodyClasses}>
          <div className="text-foreground/80">
            <Renderer content={content} />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Copy partial response"
              onClick={copy}
              className="size-7 text-muted-foreground/70 hover:text-foreground"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>

            {model && (
              <span className="text-xs text-muted-foreground/60">
                Partial · {model.displayName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
