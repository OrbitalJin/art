import type { FC } from "react";
import { Plus } from "lucide-react";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { ResultBadge, SummaryRow, SummaryText } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { statusLabelOf, type TaskFieldsInput } from "./helpers";
import { TaskFields } from "./parts";

const Summary: FC<RendererProps<TaskFieldsInput, unknown>> = ({ input }) => {
  const title = input?.title;
  const status = statusLabelOf(input?.status ?? null);

  return (
    <SummaryRow>
      {title ? <SummaryText title={title}>{title}</SummaryText> : null}
      {status ? <ResultBadge>{status}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const renderer: ToolRenderer<TaskFieldsInput, { id: string }> = {
  icon: Plus,
  title: "Created task",
  executingTitle: "Creating task",
  inputSchema: taskToolSchemas.create_task.input,
  outputSchema: taskToolSchemas.create_task.output,
  Summary,
  Detail: TaskFields,
};
