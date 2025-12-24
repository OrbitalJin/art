import type { Session, SessionSnapshot, SessionStoreIface } from "./type";
import { Memory } from "../memory/memory";

export class SessionStore implements SessionStoreIface {
  private sessions = new Map<string, Session>();
  private listeners = new Set<() => void>();
  private activeId: string | null = null;
  private snapshot: SessionSnapshot = {
    sessions: [],
    activeId: null,
  };

  constructor() {
    if (this.sessions.size === 0) {
      this.create();
    }
  }

  create(title?: string, systemPrompt?: string): Session {
    const session: Session = {
      title: title ?? "New Chat",
      id: crypto.randomUUID(),
      memory: new Memory(systemPrompt),
    };
    this.sessions.set(session.id, session);
    this.setActive(session.id);
    this.emit();
    return session;
  }

  updateTitle(id: string, title: string) {
    const hit = this.sessions.has(id);
    if (hit) {
      this.sessions.get(id)!.title = title;
    }
    this.emit();
  }

  delete(id: string) {
    const hit = this.sessions.has(id);
    if (hit) this.sessions.delete(id);
  }

  list(): Session[] {
    return [...this.sessions.values()];
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getActive(): Session | undefined {
    return this.sessions.get(this.activeId ?? "");
  }

  setActive(id: string) {
    const hit = this.sessions.has(id);
    if (hit) this.activeId = id;
    this.emit();
  }

  getSnapshot(): SessionSnapshot {
    return this.snapshot;
  }

  private updateSnapshot() {
    this.snapshot = {
      sessions: Array.from(this.sessions.values()),
      activeId: this.activeId,
    };
  }

  emit() {
    this.updateSnapshot();
    for (const listener of this.listeners) listener();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
