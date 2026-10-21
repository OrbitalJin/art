import { Trash2 } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { defineRenderer } from "../../types";
import { DeletedDetail, TaskTargetSummary } from "./parts";

type DeleteTaskInput = z.infer<typeof taskToolSchemas.delete_task.input>;
type DeleteTaskOutput = z.infer<typeof taskToolSchemas.delete_task.output>;

export const renderer = defineRenderer<DeleteTaskInput, DeleteTaskOutput>({
  icon: Trash2,
  title: "Deleted task",
  executingTitle: "Deleting task",
  inputSchema: taskToolSchemas.delete_task.input,
  outputSchema: taskToolSchemas.delete_task.output,
  Summary: TaskTargetSummary,
  Detail: DeletedDetail,
});
