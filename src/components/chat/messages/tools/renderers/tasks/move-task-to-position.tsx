import { ArrowRight } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import type { ToolRenderer } from "../../types";
import { MoveTaskDetail, MoveTaskSummary } from "./parts";

interface MoveTaskToPositionInput {
  id: string;
  status: string;
  index: number;
}

export const renderer: ToolRenderer<
  MoveTaskToPositionInput,
  { success: boolean }
> = {
  icon: ArrowRight,
  title: "Reordered task",
  executingTitle: "Reordering task",
  inputSchema: taskToolSchemas.move_task_to_position.input,
  outputSchema: taskToolSchemas.move_task_to_position.output,
  Summary: MoveTaskSummary,
  Detail: MoveTaskDetail,
};
