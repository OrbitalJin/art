import type { FC } from "react";
import { ListTodo } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { EmptyNote, RowList } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { TaskRow, TaskTargetSummary } from "./parts";

type GetTaskInput = z.infer<typeof taskToolSchemas.get_task.input>;
type GetTaskOutput = z.infer<typeof taskToolSchemas.get_task.output>;

const Detail: FC<RendererProps<GetTaskInput, GetTaskOutput>> = ({
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

export const renderer = defineRenderer<GetTaskInput, GetTaskOutput>({
  icon: ListTodo,
  title: "Read task",
  executingTitle: "Reading task",
  inputSchema: taskToolSchemas.get_task.input,
  outputSchema: taskToolSchemas.get_task.output,
  Summary: TaskTargetSummary,
  Detail,
});
