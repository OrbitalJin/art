import { MessageList } from "@/components/chat/messages/list";
import { StaticSidebar } from "@/components/chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";
import { FloatingSidebar } from "@/components/chat/sidebar/floating";
import { MessageScrollerProvider } from "@/components/ui/message-scroller";
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { useChatMessages } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { SessionType } from "@/lib/store/session/types";

const isSessionType = (value: string | undefined): value is SessionType =>
  value === "chat" || value === "agent";

export const Chat = () => {
  const { type, sessionId } = useParams<{
    type: string;
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const { messages } = useChatMessages();
  const chatState = useUIStateStore((state) => state.chatState);
  const setChatState = useUIStateStore((state) => state.setChatState);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const didSyncRef = useRef<string | null>(null);

  useEffect(() => {
    const store = useSessionStore.getState();
    const routeType = isSessionType(type) ? type : "chat";
    const syncKey = `${type ?? "chat"}:${sessionId ?? ""}`;
    if (didSyncRef.current === syncKey) return;
    didSyncRef.current = syncKey;

    if (!isSessionType(type)) {
      navigate(`/session/${routeType}`, { replace: true });
      return;
    }

    if (sessionId) {
      const session = store.getFn(sessionId);
      if (!session) {
        navigate(`/session/${routeType}`, { replace: true });
        return;
      }
      if (session.type !== routeType) {
        navigate(`/session/${session.type}/${session.id}`, { replace: true });
        return;
      }
      store.setActive(sessionId);
      return;
    }

    const active = store.activeId
      ? store.getFn(store.activeId)
      : undefined;
    if (active && active.type === routeType) {
      store.setActive(active.id);
      return;
    }

    const latest = store.sessions
      .filter((s) => s.type === routeType && !s.archived && !s.readOnly)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (latest) {
      store.setActive(latest.id);
      return;
    }

    const id = store.create(routeType);
    store.setActive(id);
  }, [type, sessionId, navigate]);

  const isOpen = chatState.sidebarOpen;
  const setIsOpen = (open: boolean) => {
    setChatState({ sidebarOpen: open });
  };

  useHotkey("Mod+/", () => textAreaRef.current?.focus());

  return (
    <div className="relative flex-1 flex flex-row select-none">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex-1 flex flex-col selection:bg-primary/50 min-w-0 overflow-x-hidden p-2 pt-0">
        <MessageScrollerProvider
          autoScroll
          defaultScrollPosition="last-anchor"
          scrollPreviousItemPeek={64}
        >
          <MessageList messages={messages} textAreaRef={textAreaRef} />
          <Prompt textAreaRef={textAreaRef} />
        </MessageScrollerProvider>
      </div>
    </div>
  );
};