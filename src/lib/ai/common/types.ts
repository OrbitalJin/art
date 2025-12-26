export type Model = {
  key: string;
  type: "gemma-3-27b-it" | "gemini-2.5-flash";
  limit: number;
};

export const Models: Model[] = [
  { key: "Art Genesis", type: "gemma-3-27b-it", limit: 128000 },
  { key: "Art Turbo", type: "gemini-2.5-flash", limit: 1000000 },
] as const;

export const DefaultModel = Models[0];

export type StreamChunk = {
  token: string;
  isFinal?: boolean;
  error?: AIError;
};

export type AIErrorType =
  | "aborted"
  | "timeout"
  | "network"
  | "rate_limit"
  | "provider"
  | "unknown";

export class AIError extends Error {
  readonly type: AIErrorType;
  readonly retryable: boolean;

  constructor(type: AIErrorType, message: string, retryable = false) {
    super(message);
    this.name = "LLMError";
    this.type = type;
    this.retryable = retryable;
  }
}
