import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Clipboard, Square } from "lucide-react";
import SelectModel from "@/components/chat/prompt/model-select";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import type { Model } from "@/lib/llm/common/types";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  isSending: boolean;
  onSend: () => void;
  model: Model;
  setModel: (model: Model) => void;
  usage: string;
  onAbort: () => void;
}

const Prompt: React.FC<Props> = ({
  prompt,
  setPrompt,
  isSending,
  onSend,
  model,
  setModel,
  onAbort,
  usage,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePaste = async () => {
    const content = await readText();
    setPrompt(content);
  };

  return (
    <footer className="z-20 px-4 pb-4">
      <div className="mx-auto max-w-2xl">
        <div
          className={cn(
            "relative flex flex-col gap-2 p-2 transition-all",
            "rounded-md border bg-muted/50 hover:bg-muted/70 hover:border-primary/30",
            "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
          )}
        >
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message..."
            className={cn(
              "bg-transparent! border-0 shadow-none resize-none p-2",
              "min-h-[40px] max-h-[200px]",
              "text-foreground/80 placeholder:text-muted-foreground focus-visible:ring-0",
            )}
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center px-1">
            <div className="flex flex-row gap-2">
              <Button variant="outline" size="icon" onClick={handlePaste}>
                <Clipboard />
              </Button>
              <SelectModel model={model} setModel={setModel} />
            </div>
            <Button
              variant="default"
              size="icon"
              className={cn(
                "transition-all duration-300",
                isSending || prompt.trim()
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100 pointer-events-none",
              )}
              onClick={isSending ? onAbort : onSend}
              disabled={!isSending && !prompt.trim()}
            >
              {isSending ? <Square /> : <ArrowUp />}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Prompt;
