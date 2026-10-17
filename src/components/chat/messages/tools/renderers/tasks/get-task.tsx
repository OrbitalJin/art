import type { FC } from "react";
import { ListTodo } from "lucide-react";
import { taskToolSchemas, type Task } from "@/lib/ai/tools/tasks";
import { EmptyNote, RowList } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { TaskRow, TaskTargetSummary } from "./parts";

const Detail: FC<RendererProps<{ id: string }, Task | null>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;
  if (!output) return <EmptyNote>Task not found.</EmptyNote>;

  return (
    <RowList>
      <TaskRow task={output} />
    </RowList>
  );
};

export const renderer: ToolRenderer<{ id: string }, Task | null> = {
  icon: ListTodo,
  title: "Read task",
  executingTitle: "Reading task",
  inputSchema: taskToolSchemas.get_task.input,
  outputSchema: taskToolSchemas.get_task.output,
  Summary: TaskTargetSummary,
  Detail,
};
