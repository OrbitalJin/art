import { useTasksStore } from "@/lib/store/use-tasks-store";
import { z } from "zod";
import type { ToolSet } from "ai";
import { tool } from "ai";
import type { Energy } from "@/lib/store/tasks/types";

const taskStatusSchema = z.enum(["backlog", "inProgress", "completed"]);
const energySchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .transform((n) => n as Energy);

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  description: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  energy: energySchema,
  due: z.string().optional(),
  status: z.enum(["backlog", "inProgress", "completed"]),
  projectId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
});

const createTaskInputSchema = z.object({
  title: z.string(),
  status: z.enum(["backlog", "inProgress", "completed"]),
  urgency: z.enum(["low", "medium", "high"]),
  energy: energySchema,
  description: z.string(),
  due: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export const tasksTools = (): ToolSet => {
  const getState = () => useTasksStore.getState();

  return {
    get_tasks: tool({
      title: "Get Tasks",
      description:
        "Get all tasks. Optionally filter by status and/or project id.",
      inputSchema: z.object({
        status: taskStatusSchema.optional(),
        projectId: z
          .string()
          .optional()
          .describe(
            "Filter by project id, or 'inbox' for tasks with no project",
          ),
      }),
      outputSchema: z.array(taskSchema),
      execute: async ({ status, projectId }) => {
        let tasks = getState().tasks;

        if (status) {
          tasks = tasks.filter((t) => t.status === status);
        }

        if (projectId) {
          tasks =
            projectId === "inbox"
              ? tasks.filter((t) => !t.projectId)
              : tasks.filter((t) => t.projectId === projectId);
        }

        return tasks;
      },
    }),

    get_task: tool({
      title: "Get Task",
      description: "Get a single task by id.",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: taskSchema.nullable(),
      execute: async ({ id }) => {
        return getState().tasks.find((t) => t.id === id) ?? null;
      },
    }),

    create_task: tool({
      title: "Create Task",
      description: "Create a new task in the given column/status.",
      inputSchema: createTaskInputSchema,
      outputSchema: z.object({ id: z.string() }),
      execute: async (input) => {
        const id = getState().createTask(input);
        return { id };
      },
    }),

    update_task: tool({
      title: "Update Task",
      description:
        "Update fields of an existing task. Only provided fields are changed.",
      inputSchema: z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        urgency: z.enum(["low", "medium", "high"]).optional(),
        energy: energySchema.optional(),
        due: z.string().optional(),
        projectId: z.string().optional(),
        dependencies: z.array(z.string()).optional(),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id, ...updates }) => {
        const exists = getState().tasks.some((t) => t.id === id);
        if (!exists) return { success: false };

        getState().updateTask(id, updates);
        return { success: true };
      },
    }),

    move_task: tool({
      title: "Move Task",
      description:
        "Move a task to a different column/status. Appends to the end of the target column.",
      inputSchema: z.object({
        id: z.string(),
        status: taskStatusSchema,
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id, status }) => {
        const exists = getState().tasks.some((t) => t.id === id);
        if (!exists) return { success: false };

        getState().moveTask(id, status);
        return { success: true };
      },
    }),

    move_task_to_position: tool({
      title: "Move Task To Position",
      description:
        "Move a task to a specific column and index (0-based) within that column.",
      inputSchema: z.object({
        id: z.string(),
        status: taskStatusSchema,
        index: z.number().min(0).describe("0-based position in the column"),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id, status, index }) => {
        const exists = getState().tasks.some((t) => t.id === id);
        if (!exists) return { success: false };

        getState().moveTaskToPosition(id, status, index);
        return { success: true };
      },
    }),

    delete_task: tool({
      title: "Delete Task",
      description: "Delete a task by id.",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id }) => {
        const exists = getState().tasks.some((t) => t.id === id);
        if (!exists) return { success: false };

        getState().deleteTask(id);
        return { success: true };
      },
    }),

    get_projects: tool({
      title: "Get Projects",
      description: "Get all projects.",
      inputSchema: z.object({}),
      outputSchema: z.array(projectSchema),
      execute: async () => {
        return getState().projects;
      },
    }),

    create_project: tool({
      title: "Create Project",
      description: "Create a new project. Returns the new project id.",
      inputSchema: z.object({
        name: z.string(),
        color: z.string().optional().describe("Optional color (e.g. hex)"),
      }),
      outputSchema: z.object({ id: z.string() }),
      execute: async ({ name, color }) => {
        const id = getState().createProject(name, color);
        return { id };
      },
    }),

    update_project: tool({
      title: "Update Project",
      description: "Update fields of an existing project.",
      inputSchema: z.object({
        id: z.string(),
        name: z.string().optional(),
        color: z.string().optional(),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id, ...updates }) => {
        const exists = getState().projects.some((p) => p.id === id);
        if (!exists) return { success: false };

        getState().updateProject(id, updates);
        return { success: true };
      },
    }),

    delete_project: tool({
      title: "Delete Project",
      description:
        "Delete a project by id. Tasks in this project are moved to the inbox.",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id }) => {
        const exists = getState().projects.some((p) => p.id === id);
        if (!exists) return { success: false };

        getState().deleteProject(id);
        return { success: true };
      },
    }),
    create_project_with_tasks: tool({
      title: "Create Project With Tasks",
      description:
        "Create a project and attach multiple tasks to it in one step. " +
        "Use this when the user wants a new project and its tasks together.",
      inputSchema: z.object({
        project: z.object({
          name: z.string(),
          color: z.string().optional(),
        }),
        tasks: z.array(createTaskInputSchema).min(1),
      }),
      outputSchema: z.object({
        projectId: z.string(),
        taskIds: z.array(z.string()),
      }),
      execute: async ({ project, tasks }) => {
        const store = useTasksStore.getState();
        const projectId = store.createProject(project.name, project.color);
        const taskIds = tasks.map((t) => store.createTask({ ...t, projectId }));
        return { projectId, taskIds };
      },
    }),
  };
};
