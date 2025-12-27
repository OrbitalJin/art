import type { AIError, Model } from "@/lib/ai/common/types";

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
  error?: AIError;
  model?: Model;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  preferredModel: Model;
  createdAt: number;
  updatedAt: number;
  active?: boolean;
}
