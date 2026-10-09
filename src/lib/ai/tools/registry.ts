export type AccessMode = "readonly" | "confirm" | "autonomous";

export type ToolCategory = "workspace" | "computer" | "interaction";

export type ToolKind = "read" | "write";

export interface ToolFamily {
  key: "journal" | "tasks" | "files" | "askUser";
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
    usage: "free",
    tools: ["ask_user"],
  },

  {
    key: "files",
    label: "Files",
    description: "Read & write local folders",
    category: "computer",
    usage: "free",
    tools: [
      "list_folders",
      "list_folder",
      "read_file",
      "stat",
      "write_file",
      "edit_file",
      "make_dir",
      "remove_path",
      "move_path",
      "copy_path",
    ],
  },
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
  "write_file",
  "edit_file",
  "make_dir",
  "remove_path",
  "move_path",
  "copy_path",
]);

export const isMutatingTool = (name: string): boolean =>
  MUTATING_TOOLS.has(name);
