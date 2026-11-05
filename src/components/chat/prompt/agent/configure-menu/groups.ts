import type { LucideIcon } from "lucide-react";
import {
  FolderClosed,
  Globe,
  Link,
  ListChecks,
  MessageCircleQuestion,
  Newspaper,
  Route,
  Table,
} from "lucide-react";
import { ExaTools } from "@/lib/ai/tools/exa";
import { READ_SHEET_TOOL_NAME } from "@/lib/ai/tools/sheets";
import type { KeyType } from "@/lib/store/use-settings-store";
import { TbBrandYoutube } from "react-icons/tb";
import type { IconType } from "react-icons";

export type Category =
  "art" | "device" | "interaction" | "integrations" | "web";

export type Source = "local" | "files";

export interface ToolGroup {
  key: string;
  label: string;
  description: string;
  category: Category;
  source: Source;
  icon: LucideIcon | IconType;
  /** Setting key required for this group's tools to work. */
  requiresKey?: KeyType;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  art: "Art",
  device: "Device",
  interaction: "Interaction",
  integrations: "Integrations",
  web: "Web",
};

export const CATEGORY_ORDER: Category[] = [
  "interaction",
  "web",
  "device",
  "integrations",
  "art",
];

export const SEARCH_GROUPS: ToolGroup[] = [
  {
    key: ExaTools.web,
    label: "Web Search",
    description: "Search the web for current information",
    category: "web",
    source: "local",
    icon: Globe,
    requiresKey: "exa",
  },
  {
    key: ExaTools.fetch,
    label: "Fetch URL",
    description: "Read the contents of a URL",
    category: "web",
    source: "local",
    icon: Link,
    requiresKey: "exa",
  },
  {
    key: ExaTools.news,
    label: "News",
    description: "Search recent news articles",
    category: "web",
    source: "local",
    icon: Newspaper,
    requiresKey: "exa",
  },
];

export const TOOL_GROUPS: ToolGroup[] = [
  ...SEARCH_GROUPS,
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
    source: "local",
    icon: ListChecks,
  },
  {
    key: "plan",
    label: "Plan",
    description: "Plan multi-step work",
    category: "interaction",
    source: "local",
    icon: Route,
  },
  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "device",
    source: "files",
    icon: FolderClosed,
  },
  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "interaction",
    source: "local",
    icon: MessageCircleQuestion,
  },
  {
    key: "youtube",
    label: "YouTube",
    description: "Pull video transcripts",
    category: "integrations",
    source: "local",
    icon: TbBrandYoutube,
  },
  {
    key: READ_SHEET_TOOL_NAME,
    label: "Google Sheets",
    description: "Read data from a shared sheet link",
    category: "integrations",
    source: "local",
    icon: Table,
  },
];
