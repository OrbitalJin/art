import type { LLMError } from "./error";

export type Model = {
  key: string;
  type: "gemma-3-27b-it" | "gemini-2.5-flash";
};

export const Models: Model[] = [
  {
    key: "Art Genesis",
    type: "gemma-3-27b-it",
  },
  {
    key: "Art Turbo",
    type: "gemini-2.5-flash",
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
  stream: (
    prompt: string,
    ids: MessageIDs,
    signal?: AbortSignal,
  ) => AsyncGenerator<StreamChunk>;
  usage: () => Promise<string>;
}
