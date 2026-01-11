import type { Model } from "@/lib/llm/common/types";

export type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "aborted"
  | "error";

export interface Message {
  id: string;
  role: "user" | "model" | "error";
  content: string;
  status: MessageStatus;
  errMsg?: string;
  model?: Model;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  preferredModel: Model;
  contextNotes: string[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}
