import type { Session } from "@/lib/store/session/types";
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
  defaultEnabled: (session: Session) => boolean;
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
  defaultEnabled: () => false,
}));

export const TOOL_FAMILIES: ToolFamily[] = [
  {
    key: "web_search",
    label: "Web Search",
    description: "Search the web for current information",
    category: "web",
    source: "builtin",
    defaultEnabled: () => true,
  },
  {
    key: "fetch_url",
    label: "Fetch URL",
    description: "Read the contents of a URL",
    category: "web",
    source: "builtin",
    defaultEnabled: () => true,
  },
  {
    key: "news_search",
    label: "News",
    description: "Search recent news articles",
    category: "web",
    source: "builtin",
    defaultEnabled: () => false,
  },
  {
    key: "flight_search",
    label: "Flights",
    description: "Search flights, schedules, and pricing",
    category: "web",
    source: "builtin",
    defaultEnabled: () => false,
  },
  {
    key: "hotel_search",
    label: "Hotels",
    description: "Search hotels and rentals with prices",
    category: "web",
    source: "builtin",
    defaultEnabled: () => false,
  },
  {
    key: "maps_search",
    label: "Places",
    description: "Search places, businesses, and locations",
    category: "web",
    source: "builtin",
    defaultEnabled: () => false,
  },
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
    category: "web",
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
