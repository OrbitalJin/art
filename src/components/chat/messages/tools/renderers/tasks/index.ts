import { ArrowRight, FolderKanban, ListTodo, Plus, Trash2 } from "lucide-react";
import type { ToolRenderer } from "../../types";
import { taskToolSchemas, type TaskToolName } from "@/lib/ai/tools/tasks";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const taskRenderers = {
  get_tasks: {
    icon: ListTodo,
    title: "Read tasks",
    inputSchema: taskToolSchemas.get_tasks.input,
    outputSchema: taskToolSchemas.get_tasks.output,
    Summary: GetTasksSummary,
    Detail: TaskListDetail,
  },
  get_task: {
    icon: ListTodo,
    title: "Read task",
    inputSchema: taskToolSchemas.get_task.input,
    outputSchema: taskToolSchemas.get_task.output,
    Summary: TaskTargetSummary,
    Detail: SingleTaskDetail,
  },
  create_task: {
    icon: Plus,
    title: "Created task",
    inputSchema: taskToolSchemas.create_task.input,
    outputSchema: taskToolSchemas.create_task.output,
    Summary: CreateTaskSummary,
    Detail: TaskFields,
  },
  update_task: {
    icon: ListTodo,
    title: "Updated task",
    inputSchema: taskToolSchemas.update_task.input,
    outputSchema: taskToolSchemas.update_task.output,
    Summary: TaskTargetSummary,
    Detail: TaskFields,
  },
  move_task: {
    icon: ArrowRight,
    title: "Moved task",
    inputSchema: taskToolSchemas.move_task.input,
    outputSchema: taskToolSchemas.move_task.output,
    Summary: MoveTaskSummary,
    Detail: MoveTaskDetail,
  },
  move_task_to_position: {
    icon: ArrowRight,
    title: "Reordered task",
    inputSchema: taskToolSchemas.move_task_to_position.input,
    outputSchema: taskToolSchemas.move_task_to_position.output,
    Summary: MoveTaskSummary,
    Detail: MoveTaskDetail,
  },
  delete_task: {
    icon: Trash2,
    title: "Deleted task",
    inputSchema: taskToolSchemas.delete_task.input,
    outputSchema: taskToolSchemas.delete_task.output,
    Summary: TaskTargetSummary,
    Detail: DeletedDetail,
  },
  get_projects: {
    icon: FolderKanban,
    title: "Read projects",
    inputSchema: taskToolSchemas.get_projects.input,
    outputSchema: taskToolSchemas.get_projects.output,
    Detail: ProjectListDetail,
  },
  create_project: {
    icon: Plus,
    title: "Created project",
    inputSchema: taskToolSchemas.create_project.input,
    outputSchema: taskToolSchemas.create_project.output,
    Summary: ProjectNameSummary,
    Detail: DoneNote,
  },
  update_project: {
    icon: FolderKanban,
    title: "Updated project",
    inputSchema: taskToolSchemas.update_project.input,
    outputSchema: taskToolSchemas.update_project.output,
    Summary: ProjectTargetSummary,
    Detail: DoneNote,
  },
  delete_project: {
    icon: Trash2,
    title: "Deleted project",
    inputSchema: taskToolSchemas.delete_project.input,
    outputSchema: taskToolSchemas.delete_project.output,
    Summary: ProjectTargetSummary,
    Detail: DeletedDetail,
  },
  create_project_with_tasks: {
    icon: FolderKanban,
    title: "Created project with tasks",
    inputSchema: taskToolSchemas.create_project_with_tasks.input,
    outputSchema: taskToolSchemas.create_project_with_tasks.output,
    Summary: ProjectWithTasksSummary,
    Detail: ProjectWithTasksDetail,
  },
} satisfies Record<TaskToolName, AnyRenderer>;
