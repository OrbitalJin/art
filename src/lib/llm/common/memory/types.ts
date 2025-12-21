import type { Model } from "../types";

export type Role = "user" | "assistant" | "system";

type MessageStatus = "streaming" | "complete" | "aborted" | "error";

export type Message = {
  id: string;
  role: Role;
  content: string;
  model?: Model;
  status?: MessageStatus;
};
