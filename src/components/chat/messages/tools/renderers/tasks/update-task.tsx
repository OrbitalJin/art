import { ListTodo } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import type { ToolRenderer } from "../../types";
import { TaskFields, TaskTargetSummary } from "./parts";

interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  urgency?: string;
  energy?: number;
  due?: string;
  projectId?: string;
  dependencies?: string[];
}

export const renderer: ToolRenderer<UpdateTaskInput, { success: boolean }> = {
  icon: ListTodo,
  title: "Updated task",
  executingTitle: "Updating task",
  inputSchema: taskToolSchemas.update_task.input,
  outputSchema: taskToolSchemas.update_task.output,
  Summary: TaskTargetSummary,
  Detail: TaskFields,
};
