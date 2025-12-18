import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLLM } from "@/contexts/llm-context";
import { ChatMessage, type Message } from "@/components/chat/message";
import SelectModel from "../chat/model-select";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

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
          <span className="">Chat</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scroll-smooth">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end py-6 gap-6">
            {messages.length === 0 && (
              <div
                className="
                flex flex-1 flex-col items-center justify-center 
                gap-4 px-4 py-10 text-center animate-in fade-in zoom-in-95 duration-500 fill-mode-forwards"
              >
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl font-semibold">How can I help you?</h2>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <ChatMessage key={idx} {...m} />
            ))}

            <div ref={bottomRef} className="h-0" />
          </div>
        </div>
      </main>

      <footer className="z-20 bg-background px-2 pb-0">
        <div className="mx-auto max-w-3xl">
          <div
            className="
            relative flex flex-col gap-2 p-2
            rounded-xl rounded-b-none border border-b-0 bg-muted/40 
            focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10 transition-all"
          >
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Message Art..."
              className="
              bg-transparent! w-full resize-none p-2 
              text-sm placeholder:text-muted-foreground 
              focus-visible:ring-0 border-0 rounded-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <div className="flex justify-between items-center">
              <SelectModel model={model} setModel={setModel} />
              <Button
                size="icon"
                className={`h-8 w-8 rounded-md transition-all duration-300 ${
                  prompt.trim()
                    ? "opacity-100 scale-110"
                    : "opacity-0 pointer-events-none"
                }`}
                onClick={handleSend}
                disabled={isSending || !prompt.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
