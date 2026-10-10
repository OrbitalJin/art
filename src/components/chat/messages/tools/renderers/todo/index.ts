import { ListTodo } from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { TodoToolName } from "@/lib/ai/tools/todo";
import { TodoListDetail, TodoSummary } from "./parts";

export const todoRenderers = {
  todo_write: {
    icon: ListTodo,
    title: "Updated plan",
    Summary: TodoSummary,
    Detail: TodoListDetail,
  },
} satisfies Record<TodoToolName, ToolRenderer>;
