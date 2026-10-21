import { ArrowRight } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { defineRenderer } from "../../types";
import { MoveTaskDetail, MoveTaskSummary } from "./parts";

type MoveTaskToPositionInput = z.infer<
  typeof taskToolSchemas.move_task_to_position.input
>;
type MoveTaskToPositionOutput = z.infer<
  typeof taskToolSchemas.move_task_to_position.output
>;

export const renderer = defineRenderer<
  MoveTaskToPositionInput,
  MoveTaskToPositionOutput
>({
  icon: ArrowRight,
  title: "Reordered task",
  executingTitle: "Reordering task",
  inputSchema: taskToolSchemas.move_task_to_position.input,
  outputSchema: taskToolSchemas.move_task_to_position.output,
  Summary: MoveTaskSummary,
  Detail: MoveTaskDetail,
});
