export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "workspace" | "computer" | "interaction";

export interface ToolFamily {
  key: "tasks" | "files" | "askUser" | "connections" | "todo";
  label: string;
  description: string;
  category: ToolCategory;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  workspace: "Workspace",
  computer: "Computer",
  interaction: "Interaction",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "interaction",
  "computer",
  "workspace",
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
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "workspace",
  },
  {
    key: "connections",
    label: "Connections",
    description: "Read-only access to Gmail",
    category: "workspace",
  },
];
