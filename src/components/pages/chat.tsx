import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Prompt from "@/components/chat/prompt/prompt";
import { useInView } from "@/hooks/use-in-view";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import WelcomeMessage from "@/components/chat/welcome";
import { MessageBroker } from "../chat/messages/broker";
import { SessionSwitcher } from "../chat/sessions";
import { useSessions } from "@/hooks/use-sessions";

export function ChatPage() {
  const sessionsApi = useSessions();
  const session = sessionsApi.ensureActive();

  const chat = useChat(session);
  const [prompt, setPrompt] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useInView(bottomRef, { threshold: 1 });

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSend = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;
    chat.sendMessage(text);
    setPrompt("");
  }, [prompt, chat]);

  return (
    <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white">
      <main className="flex-1 overflow-hidden relative px-4">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <SessionSwitcher disabled={chat.isSending} {...sessionsApi} />
        </div>
        <div className="h-full overflow-y-auto scroll-smooth">
          <ScrollArea>
            <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end py-6 gap-6">
              {chat.messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                chat.messages.map((msg) => (
                  <MessageBroker key={msg.id} {...msg} />
                ))
              )}
            </div>
          </ScrollArea>
          <div ref={bottomRef} className="h-0" />
        </div>
        <ScrollToBottomButton
          isVisible={!isAtBottom}
          onClick={scrollToBottom}
        />
      </main>

      <Prompt
        prompt={prompt}
        setPrompt={setPrompt}
        isSending={chat.isSending}
        onSend={handleSend}
        model={chat.model}
        setModel={chat.setModel}
        onAbort={chat.abortStream}
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
