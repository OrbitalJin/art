import { SessionStore } from "@/lib/llm/common/session/store";
import type { Session, SessionSnapshot } from "@/lib/llm/common/session/type";
import React, { createContext, useContext, useSyncExternalStore } from "react";

const store = new SessionStore();

interface SessionsContextValue {
  sessions: Session[];
  active: Session | null;
  activeId: string | null;

  switchTo: (session: Session) => void;
  updateTitle: (id: string, title: string) => void;
  switchToById: (id: string) => void;
  deleteSession: (id: string) => void;
  createSession: (title?: string) => Session;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export const SessionsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const snapshot: SessionSnapshot = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );

  const { activeId, sessions } = snapshot;
  const active = activeId != null ? (store.get(activeId) ?? null) : null;

  const createSession = (title?: string, systemPrompt?: string): Session => {
    return store.create(title, systemPrompt);
  };

  const deleteSession = (id: string) => {
    store.delete(id);
  };

  const switchTo = (session: Session) => {
    store.setActive(session.id);
  };

  const switchToById = (id: string) => {
    store.setActive(id);
  };

  const updateTitle = (id: string, title: string) => {
    store.updateTitle(id, title);
  };

  const value = React.useMemo(
    () => ({
      active,
      sessions,
      switchTo,
      activeId,
      updateTitle,
      switchToById,
      createSession,
      deleteSession,
    }),
    [sessions, activeId, active],
  );

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useSession must be wrapped in a SessionsContext.Provider");
  }
  return context;
};
