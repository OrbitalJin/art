import type { FC } from "react";
import { ListTodo } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import {
  EmptyNote,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { statusLabelOf } from "./helpers";
import { TaskRow } from "./parts";

type GetTasksInput = z.infer<typeof taskToolSchemas.get_tasks.input>;
type GetTasksOutput = z.infer<typeof taskToolSchemas.get_tasks.output>;

const Summary: FC<RendererProps<GetTasksInput, GetTasksOutput>> = ({
  block,
  input,
  output,
}) => {
  const status = statusLabelOf(input?.status ?? null);

  return (
    <SummaryRow>
      {status ? <SummaryText>{status}</SummaryText> : null}
      {block.state !== "executing" ? (
        <ResultBadge>{formatCount(output?.length ?? 0, "task")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<GetTasksInput, GetTasksOutput>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const tasks = output ?? [];
  if (tasks.length === 0) return <EmptyNote>No tasks.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-64">
      {tasks.map((task, index) => (
        <TaskRow key={task.id ?? index} task={task} />
      ))}
    </RowList>
  );
};

export const renderer = defineRenderer<GetTasksInput, GetTasksOutput>({
  icon: ListTodo,
  title: "Read tasks",
  executingTitle: "Reading tasks",
  inputSchema: taskToolSchemas.get_tasks.input,
  outputSchema: taskToolSchemas.get_tasks.output,
  Summary,
  Detail,
});
