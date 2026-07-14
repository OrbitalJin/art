import React, { useEffect, useRef, useState } from "react";
import { Plus, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCaptureStore } from "@/lib/store/use-capture-store";
import {
  extractImageFromClipboard,
  extractImageFromTauriClipboard,
} from "@/lib/utils/images";
import { readText } from "@tauri-apps/plugin-clipboard-manager";

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

  const submitImage = (base64: string) => {
    add({ kind: "image", content: base64, source });
    toast.success("Image captured");
  };

  const fromClipboard = async () => {
    const image = await extractImageFromTauriClipboard();
    if (image) {
      submitImage(image);
      return;
    }
    const content = await readText();
    if (content.trim()) {
      setText(content);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const types = e.clipboardData?.types ?? [];
    const hasImage =
      types.includes("Files") || types.some((t) => t.startsWith("image/"));

    if (hasImage) {
      e.preventDefault();
      (async () => {
        const fromEvent = await extractImageFromClipboard(e.clipboardData);
        if (fromEvent) {
          submitImage(fromEvent);
          return;
        }
        const fromTauri = await extractImageFromTauriClipboard();
        if (fromTauri) {
          submitImage(fromTauri);
        }
      })();
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
        onPaste={(e) => void handlePaste(e)}
        onKeyDown={handleKeyDown}
        placeholder="Paste, drop, or type — screenshots, links, notes…"
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground/50 hover:text-foreground"
                onClick={fromClipboard}
                tabIndex={-1}
              >
                <Clipboard className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">From clipboard</TooltipContent>
          </Tooltip>

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
