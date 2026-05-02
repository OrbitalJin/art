import { useState, useCallback, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Check, RotateCcw, Square, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { LLMActions } from "@/lib/types";
import { textkit } from "@/lib/llm/prompts/text-kit";
import { useLLMStreamText } from "@/hooks/use-llm-stream-text";
import { useLLM } from "@/contexts/llm-context";
import { cn } from "@/lib/utils";

interface Props {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: LLMActions;
}

const ACTION_CONFIG: Record<
  string,
  { description: string; placeholder: string }
> = {
  summarize: {
    description: "Create a concise summary of the selected text.",
    placeholder: "e.g., Make it exactly two sentences...",
  },
  rephrase: {
    description: "Rewrite the text while preserving its original meaning.",
    placeholder: "e.g., Make it sound more professional...",
  },
  bullet: {
    description: "Convert the selected text into a bulleted list.",
    placeholder: "e.g., Group by key features...",
  },
  structure: {
    description: "Reorganize the text for better flow and readability.",
    placeholder: "e.g., Use clear headings and short paragraphs...",
  },
  organize: {
    description: "Organize the selected text into a structured format.",
    placeholder: "e.g., Sort chronologically...",
  },
};

export const TextActionDialog = ({
  editor,
  isOpen,
  onOpenChange,
  action,
}: Props) => {
  const { llm } = useLLM();
  const [instructions, setInstructions] = useState("");
  const [selectionContext, setSelectionContext] = useState<{
    text: string;
    from: number;
    to: number;
  } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    text: streamedText,
    status,
    start,
    abort,
    reset,
  } = useLLMStreamText();

  useEffect(() => {
    if (isOpen) {
      // Capture the selected text immediately when opened
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, "").trim();
      setSelectionContext(text ? { text, from, to } : null);

      // Focus the input so users can type instructions immediately or just hit enter
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [isOpen, editor]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        reset();
        setInstructions("");
        setSelectionContext(null);
      }
      onOpenChange(open);
    },
    [onOpenChange, reset],
  );

  const label = action.charAt(0).toUpperCase() + action.slice(1);

  const handleProcess = () => {
    if (!selectionContext) return;
    const prompt = textkit[action](instructions.trim() || undefined);
    start(prompt, selectionContext.text);
  };

  const handleAccept = () => {
    if (!selectionContext || !streamedText.trim()) return;
    editor
      .chain()
      .deleteRange({ from: selectionContext.from, to: selectionContext.to })
      .insertContent(streamedText, {
        parseOptions: { preserveWhitespace: false },
      })
      .run();
    handleOpenChange(false);
  };

  const handleStop = () => abort();

  const handleRetry = () => {
    reset();
    setTimeout(() => handleProcess(), 50);
  };

  const isStreaming = status === "streaming";
  const isDone = status === "complete";
  const isIdle = status === "idle" || status === undefined;
  const hasSelection = !!selectionContext;

  if (!llm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Configure your API key in settings to use text generation
              features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl">{label}</DialogTitle>
            <DialogDescription>
              {ACTION_CONFIG[action]?.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col px-6 py-2 gap-4">
          {!hasSelection ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              Please select some text in the editor first.
            </div>
          ) : (
            <>
              {isIdle && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                    Custom Instructions
                    <span className="font-normal normal-case opacity-70">
                      Optional
                    </span>
                  </label>
                  <Textarea
                    ref={inputRef}
                    placeholder={ACTION_CONFIG[action]?.placeholder}
                    className="resize-none shadow-none focus-visible:ring-1"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && hasSelection) {
                        e.preventDefault();
                        handleProcess();
                      }
                    }}
                    rows={3}
                  />
                </div>
              )}

              {/* Only show result area if streaming or done to keep initial UI compact */}
              {!isIdle && (
                <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isDone ? "Result" : "Generating"}
                  </label>
                  <div
                    className={cn(
                      "rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed transition-all",
                      "min-h-[120px] max-h-[300px] overflow-y-auto",
                      isStreaming && "animate-pulse border-border/50",
                    )}
                  >
                    {streamedText}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-muted/30 p-4 px-6 mt-4 border-t flex items-center justify-end gap-2">
          {isIdle && (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={!hasSelection}>
                Generate
              </Button>
            </>
          )}

          {isStreaming && (
            <Button
              variant="secondary"
              onClick={handleStop}
              className="w-full sm:w-auto"
            >
              <Square className="mr-2 h-4 w-4 fill-current" />
              Stop Generation
            </Button>
          )}

          {isDone && (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="text-muted-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button onClick={handleAccept}>
                  <Check className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
