import type { FC } from "react";
import { FolderKanban } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import {
  DoneNote,
  ResultBadge,
  SummaryRow,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type ProjectWithTasksInput = z.infer<
  typeof taskToolSchemas.create_project_with_tasks.input
>;
type ProjectWithTasksOutput = z.infer<
  typeof taskToolSchemas.create_project_with_tasks.output
>;

const Summary: FC<RendererProps<ProjectWithTasksInput, ProjectWithTasksOutput>> =
  ({ input }) => {
    const name = input?.project.name ?? null;
    const tasks = input?.tasks ?? [];

    return (
      <SummaryRow>
        {name ? <SummaryText title={name}>{name}</SummaryText> : null}
        <ResultBadge>{formatCount(tasks.length, "task")}</ResultBadge>
      </SummaryRow>
    );
  };

const Detail: FC<RendererProps<ProjectWithTasksInput, ProjectWithTasksOutput>> =
  ({ block, input }) => {
    const name = input?.project.name ?? null;
    const titles = (input?.tasks ?? [])
      .map((task) => task.title)
      .filter((title): title is string => Boolean(title));

    return (
      <div className="flex flex-col gap-2.5">
        {name ? (
          <p className="text-[12px] font-medium text-foreground/85">{name}</p>
        ) : null}

        {titles.length > 0 ? (
          <ul className="flex max-h-48 flex-col gap-1 overflow-auto">
            {titles.map((title, index) => (
              <li
                key={index}
                className="truncate text-[11px] text-muted-foreground"
              >
                {title}
              </li>
            ))}
          </ul>
        ) : null}

        <DoneNote block={block} />
      </div>
    );
  };

export const renderer = defineRenderer<
  ProjectWithTasksInput,
  ProjectWithTasksOutput
>({
  icon: FolderKanban,
  title: "Created project with tasks",
  executingTitle: "Creating project with tasks",
  inputSchema: taskToolSchemas.create_project_with_tasks.input,
  outputSchema: taskToolSchemas.create_project_with_tasks.output,
  Summary,
  Detail,
});
