import React, { useRef, useState } from "react";
import WelcomeMessage from "../welcome";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { MessageBroker } from "./broker";
import type { Message } from "@/lib/store/session/types";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useActiveSession } from "@/contexts/active-session-context";
import { useSessionStore } from "@/lib/store/use-session-store";

interface Props {
  messages: readonly Message[];
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const MessageList: React.FC<Props> = ({ messages, textAreaRef }) => {
  const [atBottom, setAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { prompt } = useActiveSession();
  const activeId = useSessionStore((s) => s.activeId);
  const pruneMessages = useSessionStore((s) => s.pruneMessages);

  const handlePrune = (messageId: string) => {
    if (activeId) {
      pruneMessages(activeId, messageId);
    }
  };

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length,
      behavior: "smooth",
    });
  };
  return (
    <div className="flex-1 overflow-hidden relative px-4 flex flex-col select-none">
      {messages.length === 0 && prompt.length === 0 ? (
        <WelcomeMessage textAreaRef={textAreaRef} />
      ) : (
        <>
          <Virtuoso
            data={messages}
            ref={virtuosoRef}
            className="h-full"
            followOutput="smooth"
            initialTopMostItemIndex={messages.length - 1}
            atBottomStateChange={setAtBottom}
            overscan={400}
            itemContent={(index, msg) => (
              <div className="py-4 max-w-2xl mx-auto select-text">
                <MessageBroker
                  key={index}
                  {...msg}
                  onPrune={() => handlePrune(msg.id)}
                />
              </div>
            )}
          />
          <ScrollToBottomButton
            isVisible={!atBottom}
            onClick={scrollToBottom}
          />
        </>
      )}
    </div>
  );
};

interface ScrollProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToBottomButton: React.FC<ScrollProps> = ({
  isVisible,
  onClick,
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
        variant="outline"
        size="icon"
        className="rounded-full shadow-md bg-background/80 backdrop-blur border"
        onClick={onClick}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
