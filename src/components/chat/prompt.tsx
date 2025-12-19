import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import SelectModel from "../chat/model-select";
import type { Model } from "@/lib/llm/common/provider";
import { useEffect, useRef } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  isSending: boolean;
  onSend: () => void;
  model: Model;
  setModel: (model: Model) => void;
}

const Prompt: React.FC<Props> = ({
  prompt,
  setPrompt,
  isSending,
  onSend,
  model,
  setModel,
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

  return (
    <footer className="z-20 bg-transparent! px-4 pb-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex flex-col gap-2 p-2 rounded-md border bg-muted/30 focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10 transition-all">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message..."
            className="bg-transparent! border-0 shadow-none resize-none p-2 text-sm placeholder:text-muted-foreground focus-visible:ring-0 min-h-[40px] max-h-[200px]"
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center px-1">
            <SelectModel model={model} setModel={setModel} />
            <Button
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-300",
                prompt.trim()
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none",
              )}
              onClick={onSend}
              disabled={isSending || !prompt.trim()}
            >
              {isSending ? <Spinner /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Prompt;
