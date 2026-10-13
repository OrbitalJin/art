import { tool } from "ai";
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

const todoInputSchema = z.object({
  todos: z.array(todoSchema).min(1).max(20),
});
const todoOutputSchema = z.object({
  total: z.number(),
  completed: z.number(),
  in_progress: z.number(),
});

export const todoToolSchemas = {
  [TODO_TOOL_NAME]: { input: todoInputSchema, output: todoOutputSchema },
} as const;

export const todoTools = (sessionId: string) => ({
  [TODO_TOOL_NAME]: tool({
    title: "Write Todos",
    description:
      "Write your working plan as a todo list for the current task. " +
      "Always send the FULL list with every call; the new list replaces " +
      "the previous one. Use it to plan before starting multi-step work, " +
      "and re-send the list whenever statuses change or steps are added. " +
      "Aim for a short plan (3-7 steps), mark items `completed` as soon as " +
      "they finish, and add steps you discover along the way. Complete every " +
      "item before calling `done`. Skip the list for trivial single-step " +
      "requests.",
    inputSchema: todoInputSchema,
    outputSchema: todoOutputSchema,
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

export type TodoToolName = keyof ReturnType<typeof todoTools>;
