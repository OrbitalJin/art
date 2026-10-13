import {
  SUPPORTED_TOOLKITS,
  TOOLKIT_DESCRIPTIONS,
  TOOLKIT_LABELS,
} from "@/lib/services/toolkits";

export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "art" | "device" | "human" | "services" | "web";

export type ToolSource = "builtin" | "folders" | "composio";

export interface ToolFamily {
  key: string;
  label: string;
  description: string;
  category: ToolCategory;
  source: ToolSource;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  art: "Art",
  device: "Device",
  human: "Human",
  services: "Services",
  web: "Web",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "web",
  "art",
  "human",
  "device",
  "services",
];

const CONNECTION_FAMILIES: ToolFamily[] = SUPPORTED_TOOLKITS.map((toolkit) => ({
  key: toolkit,
  label: TOOLKIT_LABELS[toolkit],
  description: TOOLKIT_DESCRIPTIONS[toolkit],
  category: "services",
  source: "composio",
}));

export const TOOL_FAMILIES: ToolFamily[] = [
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
    source: "builtin",
  },
  {
    key: "todo",
    label: "Todo",
    description: "Plan multi-step work",
    category: "human",
    source: "builtin",
  },

  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "device",
    source: "folders",
  },

  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "human",
    source: "builtin",
  },

  {
    key: "youtube",
    label: "YouTube",
    description: "Pull video transcripts",
    category: "services",
    source: "builtin",
  },

  ...CONNECTION_FAMILIES,
];
