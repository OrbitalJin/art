import type { ToolRenderer } from "../../types";
import type { TaskToolName } from "@/lib/ai/tools/tasks";
import { renderer as createProject } from "./create-project";
import { renderer as createProjectWithTasks } from "./create-project-with-tasks";
import { renderer as createTask } from "./create-task";
import { renderer as deleteProject } from "./delete-project";
import { renderer as deleteTask } from "./delete-task";
import { renderer as getProjects } from "./get-projects";
import { renderer as getTask } from "./get-task";
import { renderer as getTasks } from "./get-tasks";
import { renderer as moveTask } from "./move-task";
import { renderer as moveTaskToPosition } from "./move-task-to-position";
import { renderer as updateProject } from "./update-project";
import { renderer as updateTask } from "./update-task";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const taskRenderers = {
  get_tasks: getTasks,
  get_task: getTask,
  create_task: createTask,
  update_task: updateTask,
  move_task: moveTask,
  move_task_to_position: moveTaskToPosition,
  delete_task: deleteTask,
  get_projects: getProjects,
  create_project: createProject,
  update_project: updateProject,
  delete_project: deleteProject,
  create_project_with_tasks: createProjectWithTasks,
} satisfies Record<TaskToolName, AnyRenderer>;
