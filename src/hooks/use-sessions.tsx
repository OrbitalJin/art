import { SessionStore } from "@/lib/llm/common/session/store";
import type { Session } from "@/lib/llm/common/session/type";
import { useCallback, useEffect, useState } from "react";

const store = new SessionStore();

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>(() => store.list());
  const [activeId, setActiveId] = useState<string | null>(
    () => store.getActive()?.id ?? null,
  );

  useEffect(() => {
    console.log(sessions);
  }, [sessions]);

  useEffect(() => {
    return store.subscribe(() => {
      setSessions(store.list());
      setActiveId(store.getActive()?.id ?? null);
    });
  }, []);

  const ensureActive = useCallback(
    (title?: string, systemPrompt?: string): Session => {
      return store.getActive() ?? store.create(title, systemPrompt);
    },
    [],
  );

  const create = useCallback(
    (title?: string, systemPrompt?: string): Session => {
      return store.create(title, systemPrompt);
    },
    [],
  );

  const switchTo = useCallback((session: Session) => {
    store.setActive(session.id);
  }, []);

  const switchToById = useCallback((id: string) => {
    store.setActive(id);
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    store.updateTitle(id, title);
  }, []);

  // derive active here
  const active = activeId != null ? (store.get(activeId) ?? null) : null;

  return {
    active,
    activeId,
    ensureActive,
    create,
    sessions,
    switchTo,
    updateTitle,
    switchToById,
  };
};
