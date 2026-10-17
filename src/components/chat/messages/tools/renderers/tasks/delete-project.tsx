import { Trash2 } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import type { ToolRenderer } from "../../types";
import { DeletedDetail, ProjectTargetSummary } from "./parts";

export const renderer: ToolRenderer<{ id: string }, { success: boolean }> = {
  icon: Trash2,
  title: "Deleted project",
  executingTitle: "Deleting project",
  inputSchema: taskToolSchemas.delete_project.input,
  outputSchema: taskToolSchemas.delete_project.output,
  Summary: ProjectTargetSummary,
  Detail: DeletedDetail,
};
