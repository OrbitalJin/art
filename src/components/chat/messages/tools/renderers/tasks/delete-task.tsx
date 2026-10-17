import { Trash2 } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import type { ToolRenderer } from "../../types";
import { DeletedDetail, TaskTargetSummary } from "./parts";

export const renderer: ToolRenderer<{ id: string }, { success: boolean }> = {
  icon: Trash2,
  title: "Deleted task",
  executingTitle: "Deleting task",
  inputSchema: taskToolSchemas.delete_task.input,
  outputSchema: taskToolSchemas.delete_task.output,
  Summary: TaskTargetSummary,
  Detail: DeletedDetail,
};
