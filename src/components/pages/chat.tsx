import { useCallback, useRef, useState } from "react";
import Prompt from "@/components/chat/prompt/prompt";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useChat } from "@/hooks/use-chat";
import WelcomeMessage from "@/components/chat/welcome";
import { MessageBroker } from "@/components/chat/messages/broker";
import { ChatSidebar } from "@/components/chat/sidebar/sidebar.tsx";
import { ScrollToBottomButton } from "../chat/scroll-to-bottom";

export function ChatPage() {
  const chat = useChat();
  const [prompt, setPrompt] = useState("");
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [atBottom, setAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: chat.messages.length,
      behavior: "smooth",
    });
  };

  const handleSend = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;
    chat.sendMessage(text);
    setPrompt("");

    setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: chat.messages.length - 1,
        behavior: autoScroll ? "smooth" : "auto",
        align: "end",
      });
    }, 10);
  }, [prompt, chat, autoScroll]);

  return (
    <div className="relative flex-1 flex flex-row">
      <ChatSidebar disabled={chat.isSending} usage={chat.usage} />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white min-w-0">
        <div className="flex-1 overflow-hidden relative px-4 flex flex-col">
          {chat.messages.length === 0 && <WelcomeMessage />}
          <Virtuoso
            ref={virtuosoRef}
            className="h-full"
            data={chat.messages}
            defaultItemHeight={60}
            initialTopMostItemIndex={0}
            atBottomStateChange={setAtBottom}
            overscan={200}
            itemContent={(index, msg) => (
              <div className="py-4 max-w-2xl mx-auto">
                <MessageBroker key={index} {...msg} />
              </div>
            )}
          />
          <ScrollToBottomButton
            isVisible={!atBottom}
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
