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
import { BranchOriginMarker } from "./markers/branch-origin";
import type { Message } from "@/lib/store/session/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useChatInput, useChatStream } from "@/contexts/chat-context";

interface Props {
  messages: readonly Message[];
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const SessionScrollSync: React.FC = () => {
  const activeId = useSessionStore((s) => s.activeId);
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
      <div className="relative flex flex-1 flex-col overflow-hidden px-4 select-none">
        <WelcomeMessage textAreaRef={textAreaRef} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden px-4 select-none">
      <SessionScrollSync />
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            aria-busy={isSending}
            className="mx-auto w-full max-w-3xl select-text my-8"
          >
            <BranchOriginMarker />
            {messages.map((msg) => (
              <MessageScrollerItem
                key={msg.id}
                messageId={msg.id}
                scrollAnchor={msg.role === "user"}
              >
                <MessageBroker {...msg} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton variant="outline" />
      </MessageScroller>
    </div>
  );
};
