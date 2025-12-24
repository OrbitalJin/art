import type { Memory } from "../memory/memory";

export interface Session {
  id: string;
  title: string;
  memory: Memory;
}

export interface SessionSnapshot {
  sessions: Session[];
  activeId: string | null;
}

export interface SessionStoreIface {
  create: (title?: string, systemPrompt?: string) => Session;
  delete: (id: string) => void;
  get: (id: string) => Session | undefined;
  list: () => Session[];

  setActive: (id: string) => void;
  getActive: () => Session | undefined;
  updateTitle: (id: string, title: string) => void;
  getSnapshot: () => SessionSnapshot;

  subscribe: (listener: () => void) => void;
  emit: () => void;
}
