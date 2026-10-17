import { FolderKanban } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { DoneNote } from "../../shared";
import type { ToolRenderer } from "../../types";
import { ProjectTargetSummary } from "./parts";

interface UpdateProjectInput {
  id: string;
  name?: string;
  color?: string;
}

export const renderer: ToolRenderer<UpdateProjectInput, { success: boolean }> = {
  icon: FolderKanban,
  title: "Updated project",
  executingTitle: "Updating project",
  inputSchema: taskToolSchemas.update_project.input,
  outputSchema: taskToolSchemas.update_project.output,
  Summary: ProjectTargetSummary,
  Detail: DoneNote,
};
