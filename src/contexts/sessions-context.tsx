import { SessionStore } from "@/lib/llm/common/session/store";
import type { Session, SessionSnapshot } from "@/lib/llm/common/session/type";
import React, {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  useTransition,
} from "react";

const store = new SessionStore();

interface SessionsContextValue {
  sessions: Session[];
  active: Session | null;
  activeId: string | null;
  isPending: boolean;

  switchTo: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  createSession: (title?: string) => Session;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export const SessionsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isPending, startTransition] = useTransition();

  const snapshot: SessionSnapshot = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );

  const { activeId, sessions } = snapshot;
  const active = activeId != null ? (store.get(activeId) ?? null) : null;

  const createSession = useCallback(
    (title?: string, systemPrompt?: string): Session => {
      let created!: Session;
      startTransition(() => {
        created = store.create(title, systemPrompt);
      });

      return created;
    },
    [],
  );

  const deleteSession = useCallback((id: string) => {
    startTransition(() => {
      store.delete(id);
    });
  }, []);

  const switchTo = useCallback((id: string) => {
    startTransition(() => {
      store.setActive(id);
    });
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    store.updateTitle(id, title);
  }, []);

  const value = React.useMemo(
    () => ({
      active,
      sessions,
      switchTo,
      activeId,
      updateTitle,
      isPending,
      createSession,
      deleteSession,
    }),
    [
      sessions,
      activeId,
      active,
      isPending,
      createSession,
      switchTo,
      deleteSession,
      updateTitle,
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
