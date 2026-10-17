import type { FC } from "react";
import { ListTodo } from "lucide-react";
import { taskToolSchemas, type Task } from "@/lib/ai/tools/tasks";
import {
  EmptyNote,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { statusLabelOf } from "./helpers";
import { TaskRow } from "./parts";

interface GetTasksInput {
  status?: string;
  projectId?: string;
}

const Summary: FC<RendererProps<GetTasksInput, Task[]>> = ({
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

const Detail: FC<RendererProps<GetTasksInput, Task[]>> = ({ block, output }) => {
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

export const renderer: ToolRenderer<GetTasksInput, Task[]> = {
  icon: ListTodo,
  title: "Read tasks",
  executingTitle: "Reading tasks",
  inputSchema: taskToolSchemas.get_tasks.input,
  outputSchema: taskToolSchemas.get_tasks.output,
  Summary,
  Detail,
};
