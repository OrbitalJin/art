import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLLM } from "@/contexts/llm-context";
import { Message, type MessageObject } from "@/components/chat/message";
import SelectModel from "../chat/model-select";
import { ScrollArea } from "../ui/scroll-area";
import Prompt from "../chat/prompt";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { llm, model, setModel } = useLLM();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 225);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt, adjustTextareaHeight]);

  const handleSend = async () => {
    const text = prompt.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setPrompt("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    try {
      if (!llm) throw new Error("LLM is not initialized");
      const stream = llm.stream(text);

      for await (const chunk of stream) {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          const lastMsg = next[lastIndex];

          if (lastMsg?.role === "assistant") {
            next[lastIndex] = {
              ...lastMsg,
              content: lastMsg.content + (chunk.token ?? ""),
            };
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex w-full h-14 items-center justify-center px-4 border-b">
        <div className="flex items-center gap-2">
          <span className="">Chat!</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scroll-smooth">
          <ScrollArea>
            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end py-6 gap-6">
              {messages.length === 0 && (
                <div
                  className="
                flex flex-1 flex-col items-center justify-center 
                gap-4 px-4 py-10 text-center animate-in fade-in zoom-in-95 duration-500 fill-mode-forwards"
                >
                  <div className="max-w-md space-y-2">
                    <h2 className="text-xl font-semibold">
                      How can I help you?
                    </h2>
                  </div>
                </div>
              )}

              {messages.map((m, idx) => (
                <Message key={idx} {...m} />
              ))}
            </div>
          </ScrollArea>
          <div ref={bottomRef} className="h-0" />
        </div>
      </main>

      <Prompt
        prompt={prompt}
        setPrompt={setPrompt}
        isSending={isSending}
        onSend={handleSend}
        model={model}
        setModel={setModel}
      />
    </div>
  );
}

const ScrollToBottomButton = ({
  isVisible,
  onClick,
}: {
  isVisible: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 z-30",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full shadow-md bg-background/80 backdrop-blur border h-8 px-3 text-xs"
        onClick={onClick}
      >
        <ArrowDown className="mr-1 h-3 w-3" />
        Scroll to bottom
      </Button>
    </div>
  );
};
