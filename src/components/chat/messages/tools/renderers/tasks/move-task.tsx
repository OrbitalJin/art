import { ArrowRight } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import type { ToolRenderer } from "../../types";
import { MoveTaskDetail, MoveTaskSummary } from "./parts";

interface MoveTaskInput {
  id: string;
  status: string;
}

export const renderer: ToolRenderer<MoveTaskInput, { success: boolean }> = {
  icon: ArrowRight,
  title: "Moved task",
  executingTitle: "Moving task",
  inputSchema: taskToolSchemas.move_task.input,
  outputSchema: taskToolSchemas.move_task.output,
  Summary: MoveTaskSummary,
  Detail: MoveTaskDetail,
};
