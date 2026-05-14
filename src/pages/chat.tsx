import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "@/components/chat/messages/list";
import { StaticSidebar } from "@/components/chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";
import { FloatingSidebar } from "@/components/chat/sidebar/floating";
import { useEffect, useRef } from "react";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

export const Chat = () => {
  const { messages } = useActiveSession();
  const chatState = useUIStateStore((state) => state.chatState);
  const setChatState = useUIStateStore((state) => state.setChatState);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = chatState.sidebarOpen;
  const setIsOpen = (open: boolean) => {
    setChatState({ ...chatState, sidebarOpen: open });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        textAreaRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex-1 flex flex-row select-none border rounded-md">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex-1 flex flex-col selection:bg-primary/50 min-w-0">
        <MessageList messages={messages} textAreaRef={textAreaRef} />
        <Prompt textAreaRef={textAreaRef} />
      </div>
    </div>
  );
};
