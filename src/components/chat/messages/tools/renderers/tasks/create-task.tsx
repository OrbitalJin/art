import type { FC } from "react";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { ResultBadge, SummaryRow, SummaryText } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { statusLabelOf } from "./helpers";
import { TaskFields } from "./parts";

type CreateTaskInput = z.infer<typeof taskToolSchemas.create_task.input>;
type CreateTaskOutput = z.infer<typeof taskToolSchemas.create_task.output>;

const Summary: FC<RendererProps<CreateTaskInput, CreateTaskOutput>> = ({
  input,
}) => {
  const title = input?.title;
  const status = statusLabelOf(input?.status ?? null);

  return (
    <SummaryRow>
      {title ? <SummaryText title={title}>{title}</SummaryText> : null}
      {status ? <ResultBadge>{status}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const renderer = defineRenderer<CreateTaskInput, CreateTaskOutput>({
  icon: Plus,
  title: "Created task",
  executingTitle: "Creating task",
  inputSchema: taskToolSchemas.create_task.input,
  outputSchema: taskToolSchemas.create_task.output,
  Summary,
  Detail: TaskFields,
});
