export type ModelTier = 1 | 2 | 3;
export type ModelId = "model-1" | "model-2" | "model-3";

export type ModelType =
  | "deepseek/deepseek-v4-flash"
  | "deepseek/deepseek-v4.1-flash"
  | "deepseek/deepseek-v4-pro"
  | "zai/glm-5.3-flash"
  | "anthropic/claude-haiku-4.5"
  | "alibaba/qwen3.5-flash"
  | "alibaba/qwen3.7-plus";

export type Model = {
  tier: ModelTier;
  id: ModelId;
  type: ModelType;
  displayName: string;
  description: string;
  context: number;
  capabilities: {
    vision: boolean;
    tools: boolean;
  };
};

export const MODELS: readonly Model[] = [
  {
    tier: 1,
    id: "model-1",
    type: "deepseek/deepseek-v4.1-flash",
    displayName: "Monet",
    description:
      "Fast, lightweight, and responsive. Best for quick questions, drafting, and everyday chat.",
    context: 1_000_000,
    capabilities: {
      vision: true,
      tools: true,
    },
  },
  {
    tier: 2,
    id: "model-2",
    type: "zai/glm-5.3-flash",
    displayName: "Voltaire",
    description:
      "Sharper and more composed. Better at structured writing, synthesis, and connecting ideas clearly.",
    context: 1_000_000,

    capabilities: {
      vision: true,
      tools: true,
    },
  },
  {
    tier: 3,
    id: "model-3",
    type: "anthropic/claude-haiku-4.5",
    displayName: "Chopin",
    description:
      "Most capable and deliberate. Best for nuanced reasoning, polished writing, and more demanding tasks.",
    context: 1_000_000,

    capabilities: {
      vision: true,
      tools: true,
    },
  },
];

export const DEFAULT_MODEL = MODELS[0];

export const modelById = (id?: ModelId) =>
  MODELS.find((model) => model.id === id) ?? DEFAULT_MODEL;

export const modelTypeById = (id?: ModelId) =>
  (MODELS.find((model) => model.id === id) ?? DEFAULT_MODEL).type;
