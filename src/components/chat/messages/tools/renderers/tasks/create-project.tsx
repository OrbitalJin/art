import type { FC } from "react";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { DoneNote, SummaryText } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type CreateProjectInput = z.infer<typeof taskToolSchemas.create_project.input>;
type CreateProjectOutput = z.infer<typeof taskToolSchemas.create_project.output>;

const Summary: FC<RendererProps<CreateProjectInput, CreateProjectOutput>> = ({
  input,
}) =>
  input?.name ? (
    <SummaryText title={input.name}>{input.name}</SummaryText>
  ) : null;

export const renderer = defineRenderer<CreateProjectInput, CreateProjectOutput>({
  icon: Plus,
  title: "Created project",
  executingTitle: "Creating project",
  inputSchema: taskToolSchemas.create_project.input,
  outputSchema: taskToolSchemas.create_project.output,
  Summary,
  Detail: DoneNote,
});
