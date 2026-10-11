export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "art" | "computer" | "interaction" | "connections";

export interface ToolFamily {
  key: "tasks" | "files" | "askUser" | "connections" | "todo" | "youtube";
  label: string;
  description: string;
  category: ToolCategory;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  art: "Art",
  computer: "Computer",
  interaction: "Interaction",
  connections: "Connections",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "art",
  "connections",
  "computer",
  "interaction",
];

export const TOOL_FAMILIES: ToolFamily[] = [
  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "interaction",
  },
  {
    key: "todo",
    label: "Todo",
    description: "Plan multi-step work",
    category: "interaction",
  },

  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "computer",
  },
  {
    key: "youtube",
    label: "YouTube",
    description: "Pull video transcripts",
    category: "connections",
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "art",
  },
  {
    key: "connections",
    label: "Connections",
    description: "Read-only access to Gmail, Slack & Sheets",
    category: "connections",
  },
];
