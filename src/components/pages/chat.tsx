import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Prompt from "@/components/chat/prompt/prompt";
import { useInView } from "@/hooks/use-in-view";
import { useChat } from "@/hooks/use-chat";
import WelcomeMessage from "@/components/chat/welcome";
import { MessageBroker } from "@/components/chat/messages/broker";
import { ChatSidebar } from "@/components/chat/sidebar/sidebar.tsx";
import { ScrollToBottomButton } from "../chat/scroll-to-bottom";

export function ChatPage() {
  const chat = useChat();
  const [prompt, setPrompt] = useState("");
  const [autoScroll, setAutoScroll] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Use the ScrollArea viewport as the root for IntersectionObserver
  const scrollViewport = scrollAreaRef.current?.querySelector(
    '[data-slot="scroll-area-viewport"]',
  );
  const isAtBottom = useInView(bottomRef, {
    threshold: 0.1,
    root: scrollViewport as HTMLElement | null,
  });

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSend = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;
    chat.sendMessage(text);
    setPrompt("");
  }, [prompt, chat]);

  useEffect(() => {
    if (!autoScroll) return;
    scrollToBottom();
  }, [chat.messages.length, autoScroll]);

  return (
    <div className="relative flex-1 flex flex-row">
      <ChatSidebar disabled={chat.isSending} usage={chat.usage} />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white">
        <div className="flex-1 overflow-hidden relative px-4">
          <ScrollArea
            ref={scrollAreaRef}
            className="flex flex-col mx-auto min-h-full max-w-2xl justify-end h-full"
          >
            <div className="flex flex-col gap-2 p-2">
              {chat.messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                chat.messages.map((msg) => (
                  <MessageBroker key={msg.id} {...msg} />
                ))
              )}
              <div ref={bottomRef} className="h-0" />
            </div>
          </ScrollArea>
          <ScrollToBottomButton
            isVisible={!isAtBottom}
            onClick={scrollToBottom}
          />
        </div>

        <Prompt
          prompt={prompt}
          setPrompt={setPrompt}
          isSending={chat.isSending}
          onSend={handleSend}
          model={chat.model}
          setModel={chat.setModel}
          onAbort={chat.abortStream}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          disabled={chat.isSending}
        />
      </div>
    </div>
  );
}
