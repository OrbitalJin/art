import { GmailTools, SERVICES, SearchTools } from "@/lib/services/catalog";

export type Category = "art" | "device" | "interaction" | "integrations" | "web";

export type Source = "local" | "files" | "service";

export interface ToolGroup {
  key: string;
  label: string;
  description: string;
  category: Category;
  source: Source;
  /** Composio service id; set for `source: "service"` groups. */
  service?: string;
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

const SEARCH_GROUPS: ToolGroup[] = [
  {
    key: SearchTools.web,
    service: SERVICES.search.id,
    label: "Web Search",
    description: "Search the web for current information",
    category: "web",
    source: "service",
  },
  {
    key: SearchTools.fetch,
    service: SERVICES.search.id,
    label: "Fetch URL",
    description: "Read the contents of a URL",
    category: "web",
    source: "service",
  },
  {
    key: SearchTools.news,
    service: SERVICES.search.id,
    label: "News",
    description: "Search recent news articles",
    category: "web",
    source: "service",
  },
  {
    key: SearchTools.flights,
    service: SERVICES.search.id,
    label: "Flights",
    description: "Search flights, schedules, and pricing",
    category: "web",
    source: "service",
  },
  {
    key: SearchTools.hotels,
    service: SERVICES.search.id,
    label: "Hotels",
    description: "Search hotels and rentals with prices",
    category: "web",
    source: "service",
  },
  {
    key: SearchTools.maps,
    service: SERVICES.search.id,
    label: "Maps",
    description: "Search places, businesses, and locations",
    category: "web",
    source: "service",
  },
];

const GMAIL_GROUPS: ToolGroup[] = [
  {
    key: GmailTools.fetchEmails,
    service: SERVICES.gmail.id,
    label: "Fetch Emails",
    description: "Search emails",
    category: "integrations",
    source: "service",
  },
  {
    key: GmailTools.listMessages,
    service: SERVICES.gmail.id,
    label: "List Messages",
    description: "List message ids",
    category: "integrations",
    source: "service",
  },
  {
    key: GmailTools.fetchMessageById,
    service: SERVICES.gmail.id,
    label: "Read Email",
    description: "Read one email",
    category: "integrations",
    source: "service",
  },
  {
    key: GmailTools.listLabels,
    service: SERVICES.gmail.id,
    label: "List Labels",
    description: "List Gmail labels",
    category: "integrations",
    source: "service",
  },
];

export const TOOL_GROUPS: ToolGroup[] = [
  ...SEARCH_GROUPS,
  ...GMAIL_GROUPS,
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
    source: "local",
  },
  {
    key: "todo",
    label: "Todo",
    description: "Plan multi-step work",
    category: "interaction",
    source: "local",
  },
  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "device",
    source: "files",
  },
  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "interaction",
    source: "local",
  },
  {
    key: "youtube",
    label: "YouTube",
    description: "Pull video transcripts",
    category: "integrations",
    source: "local",
  },
];
