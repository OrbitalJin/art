import { ArrowRight } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { defineRenderer } from "../../types";
import { MoveTaskDetail, MoveTaskSummary } from "./parts";

type MoveTaskInput = z.infer<typeof taskToolSchemas.move_task.input>;
type MoveTaskOutput = z.infer<typeof taskToolSchemas.move_task.output>;

export const renderer = defineRenderer<MoveTaskInput, MoveTaskOutput>({
  icon: ArrowRight,
  title: "Moved task",
  executingTitle: "Moving task",
  inputSchema: taskToolSchemas.move_task.input,
  outputSchema: taskToolSchemas.move_task.output,
  Summary: MoveTaskSummary,
  Detail: MoveTaskDetail,
});
