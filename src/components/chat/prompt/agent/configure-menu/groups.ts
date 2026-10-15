import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  FolderClosed,
  Globe,
  Link,
  ListChecks,
  ListTodo,
  Mail,
  MapPin,
  MessageCircleQuestion,
  Newspaper,
  Plane,
  Sheet,
} from "lucide-react";
import { SERVICES, SearchTools } from "@/lib/services/catalog";
import type { KeyType } from "@/lib/store/use-settings-store";
import { TbBrandYoutube } from "react-icons/tb";
import type { IconType } from "react-icons";

export type Category =
  "art" | "device" | "interaction" | "integrations" | "web";

export type Source = "local" | "files" | "service";

export interface ToolGroup {
  key: string;
  label: string;
  description: string;
  category: Category;
  source: Source;
  icon: LucideIcon | IconType;
  /** Composio service id; set for `source: "service"` groups. */
  service?: string;
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
    key: SearchTools.web,
    service: SERVICES.search.id,
    label: "Web Search",
    description: "Search the web for current information",
    category: "web",
    source: "service",
    icon: Globe,
    requiresKey: "composio",
  },
  {
    key: SearchTools.fetch,
    service: SERVICES.search.id,
    label: "Fetch URL",
    description: "Read the contents of a URL",
    category: "web",
    source: "service",
    icon: Link,
    requiresKey: "composio",
  },
  {
    key: SearchTools.news,
    service: SERVICES.search.id,
    label: "News",
    description: "Search recent news articles",
    category: "web",
    source: "service",
    icon: Newspaper,
    requiresKey: "composio",
  },
  {
    key: SearchTools.flights,
    service: SERVICES.search.id,
    label: "Flights",
    description: "Search flights, schedules, and pricing",
    category: "web",
    source: "service",
    icon: Plane,
    requiresKey: "composio",
  },
  {
    key: SearchTools.hotels,
    service: SERVICES.search.id,
    label: "Hotels",
    description: "Search hotels and rentals with prices",
    category: "web",
    source: "service",
    icon: BedDouble,
    requiresKey: "composio",
  },
  {
    key: SearchTools.maps,
    service: SERVICES.search.id,
    label: "Maps",
    description: "Search places, businesses, and locations",
    category: "web",
    source: "service",
    icon: MapPin,
    requiresKey: "composio",
  },
];

export const GMAIL_GROUP: ToolGroup = {
  key: SERVICES.gmail.id,
  service: SERVICES.gmail.id,
  label: SERVICES.gmail.label,
  description: SERVICES.gmail.description,
  category: "integrations",
  source: "service",
  icon: Mail,
  requiresKey: "composio",
};

export const SHEETS_GROUP: ToolGroup = {
  key: SERVICES.sheets.id,
  service: SERVICES.sheets.id,
  label: SERVICES.sheets.label,
  description: SERVICES.sheets.description,
  category: "integrations",
  source: "service",
  icon: Sheet,
  requiresKey: "composio",
};

export const TOOL_GROUPS: ToolGroup[] = [
  ...SEARCH_GROUPS,
  GMAIL_GROUP,
  SHEETS_GROUP,
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
    source: "local",
    icon: ListChecks,
  },
  {
    key: "todo",
    label: "Todo",
    description: "Plan multi-step work",
    category: "interaction",
    source: "local",
    icon: ListTodo,
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
];
