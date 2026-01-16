export type ModelTier = 1 | 2 | 3;

export type ModelType =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.0-flash"
  | "gemini-3-flash-preview";

export type Model = {
  tier: ModelTier;
  name: "Genesis" | "Bloom" | "Eden";
  type: ModelType;
  limit: number;
};

export const Models = [
  { tier: 1, name: "Genesis", type: "gemini-2.5-flash-lite", limit: 1_000_000 },
  { tier: 2, name: "Bloom", type: "gemini-2.0-flash", limit: 1_000_000 },
  { tier: 3, name: "Eden", type: "gemini-2.5-flash", limit: 1_000_000 },
] as const satisfies readonly Model[];

export const DefaultModel = Models[0];

export type StreamChunk = {
  token: string;
  isFinal?: boolean;
  error?: LLMError;
};

export type LLMErrorType =
  | "aborted"
  | "timeout"
  | "network"
  | "rate_limit"
  | "provider"
  | "unknown";

export class LLMError extends Error {
  readonly type: LLMErrorType;
  readonly retryable: boolean;

  constructor(type: LLMErrorType, message: string, retryable = false) {
    super(message);
    this.name = "LLMError";
    this.type = type;
    this.retryable = retryable;
  }
}
