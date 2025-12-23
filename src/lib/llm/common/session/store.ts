import type { Session, SessionId, SessionStoreIface } from "./type";
import { Memory } from "../memory/memory";

export class SessionStore implements SessionStoreIface {
  private sessions = new Map<SessionId, Memory>();
  private activeId: SessionId | null = null;

  create = (systemPrompt: string): Session => {
    const id = crypto.randomUUID();
    const mem: Memory = new Memory(systemPrompt);
    this.sessions.set(id, mem);
    return {
      id: id,
      memory: mem,
    };
  };

  delete = (id: SessionId) => {
    const hit = this.sessions.has(id);
    if (hit) this.sessions.delete(id);
  };

  list = (): SessionId[] => {
    return [...this.sessions.keys()];
  };

  get = (id: SessionId): Session | undefined => {
    const hit = this.sessions.has(id);
    if (!hit) return undefined;
    return hit
      ? {
          id: id,
          memory: this.sessions.get(id) as Memory,
        }
      : undefined;
  };

  getActive = (): SessionId | null => {
    return this.activeId;
  };

  setActive = (id: SessionId) => {
    const hit = this.sessions.has(id);
    if (hit) this.activeId = id;
  };
}

export const instance = new SessionStore();
