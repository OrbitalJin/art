import { ListTodo } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  TODO_TOOL_NAME,
  todoToolSchemas,
  type TodoToolName,
} from "@/lib/ai/tools/todo";
import { TodoListDetail, TodoSummary } from "./parts";

export const todoRenderers = {
  [TODO_TOOL_NAME]: {
    icon: ListTodo,
    title: "Updated plan",
    executingTitle: "Updating plan",
    inputSchema: todoToolSchemas[TODO_TOOL_NAME].input,
    outputSchema: todoToolSchemas[TODO_TOOL_NAME].output,
    Summary: TodoSummary,
    Detail: TodoListDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<TodoToolName, ToolRenderer<any, any>>;
