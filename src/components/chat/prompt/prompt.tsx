import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square } from "lucide-react";
import { SelectModel } from "@/components/chat/prompt/model-select";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { ReferencePicker } from "@/components/chat/prompt/reference-picker";
import { TraitPicker } from "./trait-picker";
import { ForkSession } from "./fork-session";
import { SearchGrounding } from "./search-grounding";
import { ModeSelect } from "../mode-select";

export const Prompt = () => {
  const { prompt, abortStream, setPrompt, sendMessage } = useActiveSession();
  const { isCurrentSessionStreaming } = useStreamingState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(prompt);
    }
  };

  return (
    <footer className="z-20 px-4 pb-2">
      <div className="mx-auto max-w-2xl">
        <div
          className={cn(
            "relative flex flex-col gap-2 p-2 transition-all",
            "rounded-md border hover:border-primary/30 bg-card/50 shadow-md",
            "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
          )}
        >
          <Textarea
            autoFocus
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message..."
            className={cn(
              "bg-transparent! border-0 shadow-none resize-none p-2",
              "min-h-[80px] max-h-[250px] lg:max-h-[400px]",
              "text-foreground/80 placeholder:text-muted-foreground focus-visible:ring-0",
            )}
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center px-1">
            <div className="flex flex-row gap-2">
              <SelectModel />
              <ModeSelect />
              <TraitPicker />
              <ReferencePicker />
              <ForkSession />
              <SearchGrounding />
            </div>
            <Button
              variant="default"
              size="icon"
              className={cn(
                "transition-all duration-300",
                isCurrentSessionStreaming || prompt.trim()
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100 pointer-events-none",
              )}
              onClick={
                isCurrentSessionStreaming
                  ? abortStream
                  : () => sendMessage(prompt)
              }
              disabled={!isCurrentSessionStreaming && !prompt.trim()}
            >
              {isCurrentSessionStreaming ? <Square /> : <ArrowUp />}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
