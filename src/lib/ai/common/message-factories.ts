import type { Message, MessageStatus } from "@/lib/store/session/types";
import type { Model } from "./types";

export const createUserMessage = (text: string): Message => ({
  id: crypto.randomUUID(),
  role: "user",
  content: text,
  status: "complete",
});

export const createModelMessage = (
  content: string,
  status: MessageStatus,
  model?: Model,
  errorType?: string,
): Message => ({
  id: crypto.randomUUID(),
  role: "model",
  content,
  status,
  model,
  ...(errorType && { errMsg: errorType }),
});
