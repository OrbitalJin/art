import { ListTodo } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { defineRenderer } from "../../types";
import { TaskFields, TaskTargetSummary } from "./parts";

type UpdateTaskInput = z.infer<typeof taskToolSchemas.update_task.input>;
type UpdateTaskOutput = z.infer<typeof taskToolSchemas.update_task.output>;

export const renderer = defineRenderer<UpdateTaskInput, UpdateTaskOutput>({
  icon: ListTodo,
  title: "Updated task",
  executingTitle: "Updating task",
  inputSchema: taskToolSchemas.update_task.input,
  outputSchema: taskToolSchemas.update_task.output,
  Summary: TaskTargetSummary,
  Detail: TaskFields,
});
