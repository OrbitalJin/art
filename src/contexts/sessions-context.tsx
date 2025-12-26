import { SessionStore } from "@/lib/llm/common/session/store";
import type { Session, SessionSnapshot } from "@/lib/llm/common/session/type";
import React, {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

const store = new SessionStore();

interface SessionsContextValue {
  sessions: Session[];
  active: Session | null;
  activeId: string | null;

  switchTo: (id: string) => void;
  getSession: (id: string) => Session | undefined;
  updateTitle: (id: string, title: string) => void;
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

  const createSession = useCallback(
    (title?: string, systemPrompt?: string): Session => {
      return store.create(title, systemPrompt);
    },
    [],
  );

  const deleteSession = useCallback((id: string) => {
    store.delete(id);
  }, []);

  const switchTo = useCallback((id: string) => {
    store.setActive(id);
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    store.updateTitle(id, title);
    toast.success("Session title updated");
  }, []);

  const getSession = useCallback((id: string) => {
    return store.get(id);
  }, []);

  const value = React.useMemo(
    () => ({
      active,
      sessions,
      switchTo,
      activeId,
      getSession,
      updateTitle,
      createSession,
      deleteSession,
    }),
    [
      active,
      sessions,
      activeId,
      switchTo,
      getSession,
      updateTitle,
      createSession,
      deleteSession,
    ],
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
