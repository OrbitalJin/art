import type { Model } from "@/lib/ai/common/types";

export type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "aborted"
  | "error";

export interface Message {
  id: string;
  role: "user" | "model" | "system" | "error";
  content: string;
  status: MessageStatus;
  model?: Model;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  preferredModel: Model;
}

export interface SessionState {
  sessions: Session[];
  activeId: string | null;

  ensureDefaultSession: () => void;
  getSession: (id: string) => Session | undefined;
  deleteSession: (id: string) => void;
  createSession: (title?: string) => void;
  setActive: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateTitle: (sessionId: string, newTitle: string) => void;
  setSessionModel: (sessionId: string, model: Model) => void;
}
