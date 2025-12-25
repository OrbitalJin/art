import React, { useRef, useState } from "react";
import WelcomeMessage from "../welcome";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { MessageBroker } from "./broker";
import type { Message } from "@/lib/llm/common/memory/types";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  messages: readonly Message[];
}

export const MessageList: React.FC<Props> = ({ messages }) => {
  const [atBottom, setAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length,
      behavior: "smooth",
    });
  };
  return (
    <div className="flex-1 overflow-hidden relative px-4 flex flex-col">
      {messages.length === 0 && <WelcomeMessage />}
      <Virtuoso
        ref={virtuosoRef}
        className="h-full"
        data={messages}
        followOutput="smooth"
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
      <ScrollToBottomButton isVisible={!atBottom} onClick={scrollToBottom} />
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
