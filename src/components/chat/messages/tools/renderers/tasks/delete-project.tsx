import { Trash2 } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { defineRenderer } from "../../types";
import { DeletedDetail, ProjectTargetSummary } from "./parts";

type DeleteProjectInput = z.infer<typeof taskToolSchemas.delete_project.input>;
type DeleteProjectOutput = z.infer<typeof taskToolSchemas.delete_project.output>;

export const renderer = defineRenderer<DeleteProjectInput, DeleteProjectOutput>({
  icon: Trash2,
  title: "Deleted project",
  executingTitle: "Deleting project",
  inputSchema: taskToolSchemas.delete_project.input,
  outputSchema: taskToolSchemas.delete_project.output,
  Summary: ProjectTargetSummary,
  Detail: DeletedDetail,
});
