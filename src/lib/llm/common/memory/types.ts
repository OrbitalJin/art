import type { LLMError } from "../error";
import type { Model } from "../types";

export type Role = "user" | "assistant" | "system";

type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "aborted"
  | "error";

export type Message = {
  id: string;
  role: Role;
  content: string;
  model?: Model;
  status?: MessageStatus;
  error?: LLMError;
};
