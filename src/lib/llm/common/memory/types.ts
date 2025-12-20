import type { Model } from "../provider";

export type Role = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
  model?: Model;
};
