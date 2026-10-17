import type { FC } from "react";
import { Plus } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { DoneNote, SummaryText } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";

interface CreateProjectInput {
  name: string;
  color?: string;
}

const Summary: FC<RendererProps<CreateProjectInput, unknown>> = ({ input }) =>
  input?.name ? (
    <SummaryText title={input.name}>{input.name}</SummaryText>
  ) : null;

export const renderer: ToolRenderer<CreateProjectInput, { id: string }> = {
  icon: Plus,
  title: "Created project",
  executingTitle: "Creating project",
  inputSchema: taskToolSchemas.create_project.input,
  outputSchema: taskToolSchemas.create_project.output,
  Summary,
  Detail: DoneNote,
};
