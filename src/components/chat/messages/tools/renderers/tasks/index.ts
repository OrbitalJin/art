import {
  ArrowRight,
  FolderKanban,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { TaskToolName } from "@/lib/ai/tools/tasks";
import { DoneNote } from "../../primitives";
import {
  DeletedDetail,
  MoveTaskDetail,
  ProjectListDetail,
  ProjectWithTasksDetail,
  SingleTaskDetail,
  TaskFields,
  TaskListDetail,
} from "./parts";
import {
  CreateTaskSummary,
  GetTasksSummary,
  MoveTaskSummary,
  ProjectNameSummary,
  ProjectTargetSummary,
  ProjectWithTasksSummary,
  TaskTargetSummary,
} from "./summaries";

export const taskRenderers = {
  get_tasks: {
    icon: ListTodo,
    title: "Read tasks",
    Summary: GetTasksSummary,
    Detail: TaskListDetail,
  },
  get_task: {
    icon: ListTodo,
    title: "Read task",
    Summary: TaskTargetSummary,
    Detail: SingleTaskDetail,
  },
  create_task: {
    icon: Plus,
    title: "Created task",
    Summary: CreateTaskSummary,
    Detail: TaskFields,
  },
  update_task: {
    icon: ListTodo,
    title: "Updated task",
    Summary: TaskTargetSummary,
    Detail: TaskFields,
  },
  move_task: {
    icon: ArrowRight,
    title: "Moved task",
    Summary: MoveTaskSummary,
    Detail: MoveTaskDetail,
  },
  move_task_to_position: {
    icon: ArrowRight,
    title: "Reordered task",
    Summary: MoveTaskSummary,
    Detail: MoveTaskDetail,
  },
  delete_task: {
    icon: Trash2,
    title: "Deleted task",
    Summary: TaskTargetSummary,
    Detail: DeletedDetail,
  },
  get_projects: {
    icon: FolderKanban,
    title: "Read projects",
    Detail: ProjectListDetail,
  },
  create_project: {
    icon: Plus,
    title: "Created project",
    Summary: ProjectNameSummary,
    Detail: DoneNote,
  },
  update_project: {
    icon: FolderKanban,
    title: "Updated project",
    Summary: ProjectTargetSummary,
    Detail: DoneNote,
  },
  delete_project: {
    icon: Trash2,
    title: "Deleted project",
    Summary: ProjectTargetSummary,
    Detail: DeletedDetail,
  },
  create_project_with_tasks: {
    icon: FolderKanban,
    title: "Created project with tasks",
    Summary: ProjectWithTasksSummary,
    Detail: ProjectWithTasksDetail,
  },
} satisfies Record<TaskToolName, ToolRenderer>;
