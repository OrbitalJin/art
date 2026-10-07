export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "workspace" | "computer" | "interaction";

export type ToolKind = "read" | "write";

export interface ToolFamily {
  key: "journal" | "tasks" | "knowledge" | "askUser";
  label: string;
  description: string;
  category: ToolCategory;
  usage: string;
  tools: string[];
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  workspace: "Workspace",
  computer: "Computer",
  interaction: "Interaction",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "workspace",
  "computer",
  "interaction",
];

export const TOOL_FAMILIES: ToolFamily[] = [
  {
    key: "journal",
    label: "Journal",
    description: "Read & write journal entries",
    category: "workspace",
    usage: "$$$",
    tools: [
      "get_journals",
      "get_journal",
      "create_journal",
      "update_journal",
      "delete_journal",
      "update_tags",
      "get_all_tags",
      "toggle_pinned",
      "toggle_archived",
    ],
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Create and manage tasks",
    category: "workspace",
    usage: "$$$",
    tools: [
      "get_tasks",
      "get_task",
      "create_task",
      "update_task",
      "move_task",
      "move_task_to_position",
      "delete_task",
      "get_projects",
      "create_project",
      "update_project",
      "delete_project",
      "create_project_with_tasks",
    ],
  },
  {
    key: "knowledge",
    label: "Knowledge Base",
    description: "Read files from a local folder",
    category: "computer",
    usage: "free",
    tools: ["inspect_knowledge", "read_knowledge"],
  },
  {
    key: "askUser",
    label: "Ask User",
    description: "Ask clarifying questions with choices",
    category: "interaction",
    usage: "free",
    tools: ["ask_user"],
  },
];

export const MUTATING_TOOLS: ReadonlySet<string> = new Set([
  "create_journal",
  "update_journal",
  "delete_journal",
  "update_tags",
  "toggle_pinned",
  "toggle_archived",
  "create_task",
  "update_task",
  "move_task",
  "move_task_to_position",
  "delete_task",
  "create_project",
  "update_project",
  "delete_project",
  "create_project_with_tasks",
  "create_page_from_session",
]);

export const isMutatingTool = (name: string): boolean =>
  MUTATING_TOOLS.has(name);
