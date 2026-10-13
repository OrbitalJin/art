import type { FC } from "react";
import type { Task } from "@/lib/ai/tools/tasks";
import { Arrow, ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { formatCount } from "../../helpers";
import type { RendererProps } from "../../types";
import {
  shortId,
  statusLabelOf,
  type TaskFieldsInput,
  type TaskTargetInput,
} from "./helpers";

export const GetTasksSummary: FC<
  RendererProps<{ status?: string; projectId?: string }, Task[]>
> = ({ block, input, output }) => {
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

export const TaskTargetSummary: FC<
  RendererProps<TaskTargetInput, Task | null>
> = ({ input, output }) => {
  const title = output?.title ?? input?.title;
  if (title) return <SummaryText title={title}>{title}</SummaryText>;

  return input?.id ? (
    <SummaryText mono>{shortId(input.id)}</SummaryText>
  ) : null;
};

export const CreateTaskSummary: FC<
  RendererProps<TaskFieldsInput, unknown>
> = ({ input }) => {
  const title = input?.title;
  const status = statusLabelOf(input?.status ?? null);

  return (
    <SummaryRow>
      {title ? <SummaryText title={title}>{title}</SummaryText> : null}
      {status ? <ResultBadge>{status}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const MoveTaskSummary: FC<
  RendererProps<{ id: string; status: string }, unknown>
> = ({ input }) => {
  const id = input?.id ?? null;
  const status = statusLabelOf(input?.status ?? null);

  return (
    <SummaryRow>
      {id ? <SummaryText mono>{shortId(id)}</SummaryText> : null}
      {id && status ? <Arrow /> : null}
      {status ? <SummaryText>{status}</SummaryText> : null}
    </SummaryRow>
  );
};

export const ProjectNameSummary: FC<
  RendererProps<{ name: string; color?: string }, unknown>
> = ({ input }) =>
  input?.name ? (
    <SummaryText title={input.name}>{input.name}</SummaryText>
  ) : null;

export const ProjectTargetSummary: FC<
  RendererProps<{ id: string; name?: string }, unknown>
> = ({ input }) => {
  if (input?.name)
    return <SummaryText title={input.name}>{input.name}</SummaryText>;

  return input?.id ? (
    <SummaryText mono>{shortId(input.id)}</SummaryText>
  ) : null;
};

interface ProjectWithTasksInput {
  project: { name: string; color?: string };
  tasks: TaskFieldsInput[];
}

export const ProjectWithTasksSummary: FC<
  RendererProps<ProjectWithTasksInput, unknown>
> = ({ input }) => {
  const name = input?.project.name ?? null;
  const tasks = input?.tasks ?? [];

  return (
    <SummaryRow>
      {name ? <SummaryText title={name}>{name}</SummaryText> : null}
      <ResultBadge>{formatCount(tasks.length, "task")}</ResultBadge>
    </SummaryRow>
  );
};
