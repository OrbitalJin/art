import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/chat/messages/message";
import { ScrollArea } from "../ui/scroll-area";
import Prompt from "@/components/chat/prompt/prompt";
import { useInView } from "@/hooks/use-in-view";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import WelcomeMessage from "@/components/chat/welcome";

export function ChatPage() {
  const {
    messages,
    sendMessage,
    isSending,
    model,
    setModel,
    usage,
    abortStream,
  } = useChat();
  const [prompt, setPrompt] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useInView(bottomRef, { threshold: 1 });

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSend = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;
    sendMessage(text);
    setPrompt("");
  }, [prompt, sendMessage]);

  return (
    <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white">
      <main className="flex-1 overflow-hidden relative px-4">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <TabsDemo></TabsDemo>
        </div>
        <div className="h-full overflow-y-auto scroll-smooth">
          <ScrollArea>
            <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end py-6 gap-6">
              {messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                messages.map((msg) => <Message key={msg.id} {...msg} />)
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
        isSending={isSending}
        onSend={handleSend}
        model={model}
        setModel={setModel}
        usage={usage}
        onAbort={abortStream}
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

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDemo() {
  return (
    <Tabs defaultValue="school">
      <TabsList className="shadow-md backdrop-blur-2xl">
        <TabsTrigger value="school">School</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="private">Private</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
