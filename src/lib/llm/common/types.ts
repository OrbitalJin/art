import type { LLMError } from "./error";
import type { Session } from "./session/type";

export type Model = {
  key: string;
  type: "gemma-3-27b-it" | "gemini-2.5-flash";
  limit: number;
};

export const Models: Model[] = [
  {
    key: "Art Genesis",
    type: "gemma-3-27b-it",
    limit: 128000,
  },
  {
    key: "Art Turbo",
    type: "gemini-2.5-flash",
    limit: 1000000,
  },
] as const;

export type StreamChunk = {
  token: string;
  isFinal?: boolean;
  error?: LLMError;
};

export type MessageIDs = {
  userId: string;
  assistantId: string;
};

export default interface LLMProviderIface {
  gen: (prompt: string, session: Session) => Promise<string>;
  stream: (
    prompt: string,
    ids: MessageIDs,
    session: Session,
    signal?: AbortSignal,
  ) => AsyncGenerator<StreamChunk>;
  usage: (session: Session) => string;
}
