import type { GroundingMetadata } from "@google/genai";

export type ModelTier = 1 | 2 | 3;
export type ModelId = "Genesis" | "Bloom" | "Eden";

export type ModelType =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.0-flash"
  | "gemini-3.1-flash-lite-preview";

export type Model = {
  tier: ModelTier;
  id: ModelId;
  type: ModelType;
  description: string;
  limit: number;
};

export const MODELS: readonly Model[] = [
  {
    tier: 1,
    id: "Genesis",
    type: "gemini-2.5-flash-lite",
    description: "Quick and simple, meant to keep ideas moving.",
    limit: 1_000_000,
  },
  {
    tier: 2,
    id: "Bloom",
    type: "gemini-2.5-flash",
    description: "More thoughtful, carefully connects ideas.",
    limit: 1_000_000,
  },
  {
    tier: 3,
    id: "Eden",
    type: "gemini-3.1-flash-lite-preview",
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
