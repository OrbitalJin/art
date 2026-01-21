import type { Message, MessageStatus } from "@/lib/store/session/types";
import type { ModelId } from "./types";

export const createUserMessage = (text: string): Message => ({
  id: crypto.randomUUID(),
  role: "user",
  content: text,
  status: "complete",
});

export const createModelMessage = (
  content: string,
  status: MessageStatus,
  grounded?: boolean,
  modelId?: ModelId,
  errorType?: string,
): Message => ({
  id: crypto.randomUUID(),
  role: "model",
  content,
  status,
  grounded,
  modelId,
  ...(errorType && { errMsg: errorType }),
});
