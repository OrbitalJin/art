import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { useTodoStore } from "@/lib/store/use-todo-store";

export const TODO_TOOL_NAME = "todo_write";

const todoSchema = z.object({
  content: z
    .string()
    .min(1)
    .describe(
      "Short, imperative description of the step (e.g. 'Fetch journal entries').",
    ),
  status: z
    .enum(["pending", "in_progress", "completed"])
    .describe(
      "Current state of the step. Exactly one step should be 'in_progress' at a time.",
    ),
});

export const todoTools = (sessionId: string): ToolSet => ({
  [TODO_TOOL_NAME]: tool({
    title: "Write Todos",
    description:
      "Write your working plan as a todo list for the current task. " +
      "Always send the FULL list with every call; the new list replaces " +
      "the previous one. Use it to plan before starting multi-step work, " +
      "and re-send the list whenever statuses change or steps are added.",
    inputSchema: z.object({
      todos: z.array(todoSchema).min(1).max(20),
    }),
    outputSchema: z.object({
      total: z.number(),
      completed: z.number(),
      in_progress: z.number(),
    }),
    execute: async ({ todos }) => {
      const plan = useTodoStore.getState().write(sessionId, todos);

      const completed = plan.todos.filter(
        (todo) => todo.status === "completed",
      ).length;
      const in_progress = plan.todos.filter(
        (todo) => todo.status === "in_progress",
      ).length;

      return { total: plan.todos.length, completed, in_progress };
    },
  }),
});
