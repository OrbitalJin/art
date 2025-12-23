import type { Memory } from "../memory/memory";

export type SessionId = string;
export interface Session {
  id: SessionId;
  memory: Memory;
}

export interface SessionStoreIface {
  create: (systemPrompt: string) => Session;
  delete: (id: SessionId) => void;
  list: () => SessionId[];
  get: (id: SessionId) => Session | undefined;
  setActive: (id: SessionId) => void;
  getActive: () => SessionId | null;
}
