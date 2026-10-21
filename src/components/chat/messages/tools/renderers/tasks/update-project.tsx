import { FolderKanban } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { DoneNote } from "../../shared";
import { defineRenderer } from "../../types";
import { ProjectTargetSummary } from "./parts";

type UpdateProjectInput = z.infer<typeof taskToolSchemas.update_project.input>;
type UpdateProjectOutput = z.infer<typeof taskToolSchemas.update_project.output>;

export const renderer = defineRenderer<UpdateProjectInput, UpdateProjectOutput>({
  icon: FolderKanban,
  title: "Updated project",
  executingTitle: "Updating project",
  inputSchema: taskToolSchemas.update_project.input,
  outputSchema: taskToolSchemas.update_project.output,
  Summary: ProjectTargetSummary,
  Detail: DoneNote,
});
