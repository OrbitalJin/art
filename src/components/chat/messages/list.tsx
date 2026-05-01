import React, { useRef, useState, useEffect, useCallback } from "react";
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
  const prevActiveIdRef = useRef(activeId);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      align: "end",
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (prevActiveIdRef.current !== activeId) {
      prevActiveIdRef.current = activeId;
      scrollToBottom();
    }
  }, [activeId, scrollToBottom]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden px-4 select-none">
      {messages.length === 0 && prompt.length === 0 ? (
        <WelcomeMessage textAreaRef={textAreaRef} />
      ) : (
        <>
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            className="h-full"
            initialTopMostItemIndex={{
              index: messages.length - 1,
              align: "end",
            }}
            followOutput={true}
            atBottomStateChange={setAtBottom}
            itemContent={(_, msg) => (
              <div className="mx-auto max-w-2xl py-4 select-text">
                <MessageBroker {...msg} />
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
        "absolute bottom-4 left-1/2 z-30 -translate-x-1/2 transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border bg-background/80 shadow-md backdrop-blur"
        onClick={onClick}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
