import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useChat } from "@/contexts/chat-context";
import { TraitSelect } from "./trait-select";
import { ModeSelect } from "./mode-select";
import { ModelSelect } from "@/components/chat/prompt/model-select";
import { ToolOptions } from "./tool-options";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const Prompt: React.FC<Props> = ({ textAreaRef }) => {
  const { prompt, abortStream, setPrompt, sendMessage, isSending } = useChat();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt, textAreaRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (enterKeySends ? !e.shiftKey : e.shiftKey)) {
      e.preventDefault();
      sendMessage(prompt);
    }
  };

  return (
    <footer className="z-20 px-4 pb-2">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "relative flex flex-col gap-2 p-2 transition-all",
            "rounded-md border hover:border-primary/30 bg-card/50 shadow-md",
            "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
          )}
        >
          <Textarea
            autoFocus
            ref={textAreaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message..."
            className={cn(
              "bg-transparent! border-0 shadow-none resize-none p-2",
              "min-h-[80px] max-h-[250px] lg:max-h-[400px]",
              "text-foreground/80 placeholder:text-muted-foreground/50 focus-visible:ring-0",
            )}
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center px-1">
            <div className="flex flex-row gap-2">
              <ModelSelect />
              <ToolOptions />
              <ModeSelect />
              <TraitSelect />
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
              onClick={isSending ? abortStream : () => sendMessage(prompt)}
              disabled={!isSending && !prompt.trim()}
            >
              {isSending ? <Square className="animate-pulse" /> : <ArrowUp />}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
