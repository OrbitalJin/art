import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/ai/tools/tasks";
import {
  Arrow,
  DoneNote,
  EmptyNote,
  KeyValueList,
  ListRow,
  MetaLine,
  SummaryRow,
  SummaryText,
} from "../../shared";
import type { RendererProps } from "../../types";
import { shortId, statusLabelOf, type TaskFieldsInput } from "./helpers";

/* Shared presentational pieces */

const titleOf = (value: unknown): string | null => {
  if (value && typeof value === "object" && "title" in value) {
    const title = (value as { title?: unknown }).title;
    return typeof title === "string" ? title : null;
  }
  return null;
};

export const StatusDot: FC<{ status: string | null }> = ({ status }) => {
  const tone =
    status === "completed"
      ? "bg-emerald-500/70"
      : status === "inProgress"
        ? "bg-amber-500/70"
        : "bg-muted-foreground/30";

  return (
    <span
      aria-hidden
      className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", tone)}
    />
  );
};

export const TaskRow: FC<{ task: Task }> = ({ task }) => {
  const done = task.status === "completed";
  const urgencyLabel =
    task.urgency === "high" ? (
      <span className="text-red-600/90 dark:text-red-400/90">
        high urgency
      </span>
    ) : task.urgency ? (
      `${task.urgency} urgency`
    ) : null;

  const titleClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    done ? "text-foreground/50 line-through" : "text-foreground/85",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-start gap-2">
        <StatusDot status={task.status} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={titleClasses}>{task.title}</span>
          {task.description ? (
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
              {task.description}
            </p>
          ) : null}
          <MetaLine
            items={[
              statusLabelOf(task.status),
              urgencyLabel,
              `Energy ${task.energy}/5`,
              task.due ? `Due ${task.due}` : null,
            ]}
          />
        </div>
      </div>
    </ListRow>
  );
};

/* Renderers shared by more than one tool */

export const TaskTargetSummary: FC<
  RendererProps<{ id?: string; title?: string }, unknown>
> = ({ input, output }) => {
  const title = titleOf(output) ?? input?.title;
  if (title) return <SummaryText title={title}>{title}</SummaryText>;

  return input?.id ? (
    <SummaryText mono>{shortId(input.id)}</SummaryText>
  ) : null;
};

export const TaskFields: FC<RendererProps<TaskFieldsInput, unknown>> = ({
  block,
  input,
}) => {
  const entries: { label: string; value: ReactNode }[] = [];
  if (input?.description)
    entries.push({ label: "Description", value: input.description });
  if (input?.status)
    entries.push({ label: "Status", value: statusLabelOf(input.status) });
  if (input?.urgency) entries.push({ label: "Urgency", value: input.urgency });
  if (input?.energy !== undefined)
    entries.push({ label: "Energy", value: `${input.energy}/5` });
  if (input?.due) entries.push({ label: "Due", value: input.due });

  return (
    <div className="flex flex-col gap-2.5">
      {entries.length > 0 ? <KeyValueList entries={entries} /> : null}
      <DoneNote block={block} />
    </div>
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

export const MoveTaskDetail: FC<RendererProps<unknown, unknown>> = ({
  block,
}) =>
  block.state === "result" ? (
    <DoneNote block={block} />
  ) : (
    <EmptyNote>Moving…</EmptyNote>
  );

export const DeletedDetail: FC<RendererProps<unknown, unknown>> = ({ block }) => (
  <DoneNote block={block} label="Deleted" />
);

export const ProjectTargetSummary: FC<
  RendererProps<{ id: string; name?: string }, unknown>
> = ({ input }) => {
  if (input?.name)
    return <SummaryText title={input.name}>{input.name}</SummaryText>;

  return input?.id ? (
    <SummaryText mono>{shortId(input.id)}</SummaryText>
  ) : null;
};
