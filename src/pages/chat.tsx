import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "@/components/chat/messages/list";
import { StaticSidebar } from "@/components/chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";
import { FloatingSidebar } from "@/components/chat/sidebar/floating";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useEffect, useRef } from "react";
import { useGenerateSessionTitle } from "@/hooks/use-generate-session-title";
import { useSessionStore } from "@/lib/store/use-session-store";

export const Chat = () => {
  const chat = useActiveSession();
  const isOpen = useSettingsStore((state) => state.chatSidebarOpen);
  const setIsOpen = useSettingsStore((state) => state.setChatSidebarOpen);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const sessions = useSessionStore((state) => state.sessions);
  const { generateTitle } = useGenerateSessionTitle();

  useEffect(() => {
    const activeSession = sessions.find((s) => s.id === chat.streamingSessionId);
    if (activeSession?.messages.length === 1 && !activeSession.titleGenerated) {
      generateTitle(activeSession.id);
    }
  }, [chat.streamingSessionId, sessions, generateTitle]);

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
    <div className="relative flex-1 flex flex-row select-none">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex-1 flex flex-col selection:bg-primary/50 min-w-0">
        <MessageList messages={chat.messages} textAreaRef={textAreaRef} />
        <Prompt textAreaRef={textAreaRef} />
      </div>
    </div>
  );
};
