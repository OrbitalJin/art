import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCaptureStore } from "@/lib/store/use-capture-store";
import cn from "cnfast";

const URL_PATTERN = /^https?:\/\/\S+$/;
const detectKind = (content: string): "text" | "link" =>
  URL_PATTERN.test(content.trim()) ? "link" : "text";

interface Props {
  source: string;
  contentRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const CaptureComposer: React.FC<Props> = ({
  source,
  contentRef: externalRef,
}) => {
  const add = useCaptureStore((state) => state.add);
  const [text, setText] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  useEffect(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  const isEmpty = !text.trim();

  const submitText = () => {
    const content = text.trim();
    if (!content) return;
    add({ kind: detectKind(content), content, source });
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitText();
      return;
    }
    if (e.key === "Escape" && text.trim()) {
      e.preventDefault();
      setText("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card shadow-sm transition-all",
        "hover:border-primary/30",
        "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
        !isEmpty && "border-primary/40",
      )}
    >
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Paste, or type links, notes…"
        className={cn(
          "min-h-[52px] max-h-[250px] resize-none border-0 shadow-none",
          "bg-transparent! px-3 pt-3 pb-0 text-base md:text-sm",
          "text-foreground/80 placeholder:text-muted-foreground/50",
          "focus-visible:ring-0",
        )}
      />

      <div className="flex items-center justify-between px-3 pb-3 pt-2 bg-background/50 rounded-b-md">
        <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground/50 sm:flex">
          <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
            Ctrl
          </kbd>
          <span className="text-muted-foreground/40">+</span>
          <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
            Shift
          </kbd>
          <span className="text-muted-foreground/40">+</span>
          <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
            C
          </kbd>
          <span className="ml-1">capture from anywhere</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={submitText}
            disabled={isEmpty}
            variant={isEmpty ? "outline" : "default"}
            className={cn(
              "transition-all duration-300 gap-1.5",
              isEmpty && "text-muted-foreground/50 border-muted-foreground/20",
            )}
          >
            <Plus className="size-4" />
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
};
