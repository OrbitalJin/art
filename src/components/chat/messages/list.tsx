import React, { useEffect, useRef } from "react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";
import WelcomeMessage from "../welcome";
import { MessageBroker } from "./broker";
import { MessageRail } from "./rail";
import { BranchOriginMarker } from "./markers/branch-origin";
import type { Message } from "@/lib/store/session/types";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";

interface Props {
  messages: readonly Message[];
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const SessionScrollSync: React.FC = () => {
  const activeId = useSessionIndex((s) => s.activeId);
  const { scrollToEnd } = useMessageScroller();
  const prevActiveIdRef = useRef(activeId);

  useEffect(() => {
    if (prevActiveIdRef.current !== activeId) {
      prevActiveIdRef.current = activeId;
      scrollToEnd();
    }
  }, [activeId, scrollToEnd]);

  return null;
};

export const MessageList: React.FC<Props> = ({ messages, textAreaRef }) => {
  const { prompt } = useChatInput();
  const { isSending } = useChatStream();

  if (messages.length === 0 && prompt.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden px-4 pb-[calc(var(--prompt-height,0px)_+_1rem)] select-none">
        <WelcomeMessage textAreaRef={textAreaRef} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col min-w-0 overflow-x-hidden select-none @container">
      <SessionScrollSync />
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            aria-busy={isSending}
            className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden select-text mt-8"
          >
            <BranchOriginMarker />
            {messages.map((msg) => (
              <MessageScrollerItem key={msg.id} messageId={msg.id}>
                <MessageBroker {...msg} />
              </MessageScrollerItem>
            ))}
            <div
              aria-hidden
              className="h-[calc(var(--prompt-height,0px)_+_1rem)] shrink-0"
            />
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton
          variant="outline"
          className="data-[direction=end]:bottom-[calc(var(--prompt-height,0px)_+_1.5rem)]"
        />
        <MessageRail messages={messages} />
      </MessageScroller>
    </div>
  );
};
