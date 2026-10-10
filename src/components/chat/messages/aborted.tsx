import { useState } from "react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { Renderer } from "@/components/chat/messages/renderer";
import { useCopy } from "@/hooks/use-copy";
import { MODELS } from "@/lib/ai/models";

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

interface PartialFooterProps {
  copied: boolean;
  onCopy: () => void;
  modelName?: string;
}

const PartialFooter: React.FC<PartialFooterProps> = ({
  copied,
  onCopy,
  modelName,
}) => {
  const copyButtonClasses = cn(
    "size-6 text-muted-foreground/60 hover:bg-transparent",
    "hover:text-foreground",
  );

  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Copy partial response"
        onClick={onCopy}
        className={copyButtonClasses}
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>

      {modelName && (
        <span className="text-xs text-muted-foreground/50">{modelName}</span>
      )}
    </div>
  );
};

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

  const toggleClasses = cn(
    pillClasses,
    "cursor-pointer outline-none select-none",
    "transition-colors duration-150 hover:bg-destructive/10",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const chevronClasses = cn(
    "text-destructive/50 transition-transform duration-200",
    "motion-reduce:transition-none",
    isOpen && "rotate-90",
  );

  const bodyClasses = cn(
    "mt-3 flex flex-col gap-1 border-l border-border pl-4",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
  );

  return (
    <div className="w-full min-w-0 animate-in fade-in duration-100 select-auto">
      <Marker variant="separator">
        <MarkerContent>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className={toggleClasses}
          >
            <StoppedDot />
            Stopped by you
            <ChevronRight size={8} className={chevronClasses} />
          </button>
        </MarkerContent>
      </Marker>

      {isOpen && (
        <div className={bodyClasses}>
          <div className="text-foreground/80">
            <Renderer content={content} />
          </div>

          <PartialFooter
            copied={copied}
            onCopy={copy}
            modelName={model?.displayName}
          />
        </div>
      )}
    </div>
  );
};
