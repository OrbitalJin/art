import type { Session } from "@/lib/store/session/types";
import {
  SUPPORTED_TOOLKITS,
  TOOLKIT_DESCRIPTIONS,
  TOOLKIT_LABELS,
} from "@/lib/services/toolkits";

export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "art" | "device" | "human" | "services";

export type ToolSource = "builtin" | "folders" | "composio";

export interface ToolFamily {
  key: string;
  label: string;
  description: string;
  category: ToolCategory;
  source: ToolSource;
  defaultEnabled: (session: Session) => boolean;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  art: "Art",
  device: "Device",
  human: "Human",
  services: "Services",
};

export const CATEGORY_ORDER: ToolCategory[] = [
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
  defaultEnabled: () => false,
}));

export const TOOL_FAMILIES: ToolFamily[] = [
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
    source: "builtin",
    defaultEnabled: () => false,
  },
  {
    key: "todo",
    label: "Todo",
    description: "Plan multi-step work",
    category: "human",
    source: "builtin",
    defaultEnabled: (session) => session.type === "agent",
  },

  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "device",
    source: "folders",
    defaultEnabled: (session) => (session.folders?.length ?? 0) > 0,
  },

  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "human",
    source: "builtin",
    defaultEnabled: (session) => session.type === "agent",
  },

  {
    key: "youtube",
    label: "YouTube",
    description: "Pull video transcripts",
    category: "services",
    source: "builtin",
    defaultEnabled: () => false,
  },

  ...CONNECTION_FAMILIES,
];

const FAMILY_BY_KEY = new Map(
  TOOL_FAMILIES.map((family) => [family.key, family]),
);

export const toolFamily = (key: string): ToolFamily | undefined =>
  FAMILY_BY_KEY.get(key);
