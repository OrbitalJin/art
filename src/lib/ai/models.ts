export type ModelTier = 1 | 2 | 3;
export type ModelId = "model-1" | "model-2" | "model-3";

export type ModelType =
  | "deepseek/deepseek-v4-flash"
  | "deepseek/deepseek-v4-pro"
  | "alibaba/qwen3.7-plus";

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
    type: "deepseek/deepseek-v4-flash",
    displayName: "Monet",
    description:
      "Fast, lightweight, and responsive. Best for quick questions, drafting, and everyday chat.",
    limit: 1_000_000,
  },
  {
    tier: 2,
    id: "model-2",
    type: "alibaba/qwen3.7-plus",
    displayName: "Voltaire",
    description:
      "Sharper and more composed. Better at structured writing, synthesis, and connecting ideas clearly.",
    limit: 1_000_000,
  },
  {
    tier: 3,
    id: "model-3",
    type: "deepseek/deepseek-v4-pro",
    displayName: "Chopin",
    description:
      "Most capable and deliberate. Best for nuanced reasoning, polished writing, and more demanding tasks.",
    limit: 1_000_000,
  },
];

export const DEFAULT_MODEL = MODELS[0];

export const modelById = (id?: ModelId) =>
  MODELS.find((model) => model.id === id) ?? DEFAULT_MODEL;

export const modelTypeById = (id?: ModelId) =>
  (MODELS.find((model) => model.id === id) ?? DEFAULT_MODEL).type;
