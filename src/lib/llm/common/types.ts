import type { GroundingMetadata } from "@google/genai";

export type ModelTier = 1 | 2 | 3;
export type ModelId = "model-1" | "model-2" | "model-3";

export type ModelType =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-3.1-flash"
  | "gemini-3.1-flash-lite";

export type Model = {
  tier: ModelTier;
  id: ModelId;
  type: ModelType;
  displayName: string;
  description: string;
  limit: number;
};

export const MODELS: readonly Model[] = [
  {
    tier: 1,
    id: "model-1",
    type: "gemini-2.5-flash-lite",
    displayName: "Monet",
    description: "Quick and simple, meant to keep ideas moving.",
    limit: 1_000_000,
  },
  {
    tier: 2,
    id: "model-2",
    type: "gemini-3.1-flash-lite",
    displayName: "Voltaire",
    description: "More thoughtful, carefully connects ideas.",
    limit: 1_000_000,
  },
  {
    tier: 3,
    id: "model-3",
    type: "gemini-3.1-flash",
    displayName: "Chopin",
    description: "Deep and deliberate, built to deliver.",
    limit: 1_000_000,
  },
];

export const DEFAULT_MODEL = MODELS[0];

export type StreamChunk = {
  token: string;
  isFinal?: boolean;
  error?: LLMError;
  metadata?: GroundingMetadata;
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
