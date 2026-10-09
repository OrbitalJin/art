import { ListTodo } from "lucide-react";
import type { ToolRenderer } from "../../types";
import { TodoListDetail, TodoSummary } from "./parts";

export const todoRenderers: Record<string, ToolRenderer> = {
  todo_write: {
    icon: ListTodo,
    title: "Updated plan",
    Summary: TodoSummary,
    Detail: TodoListDetail,
  },
};
