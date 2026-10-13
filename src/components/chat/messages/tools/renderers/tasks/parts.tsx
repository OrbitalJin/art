import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/lib/ai/tools/tasks";
import {
  DoneNote,
  EmptyNote,
  KeyValueList,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import type { RendererProps } from "../../types";
import {
  statusLabelOf,
  type TaskFieldsInput,
} from "./helpers";

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

export const TaskListDetail: FC<
  RendererProps<{ status?: string; projectId?: string }, Task[]>
> = ({ block, output }) => {
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

export const SingleTaskDetail: FC<RendererProps<{ id: string }, Task | null>> = ({
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

export const ProjectListDetail: FC<
  RendererProps<Record<string, never>, Project[]>
> = ({ output }) => {
  const projects = output ?? [];
  if (projects.length === 0) return <EmptyNote>No projects.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-56">
      {projects.map((project) => (
        <ListRow key={project.id}>
          <span className="truncate text-[12px] text-foreground/85">
            {project.name}
          </span>
        </ListRow>
      ))}
    </RowList>
  );
};

interface ProjectWithTasksInput {
  project: { name: string; color?: string };
  tasks: TaskFieldsInput[];
}

export const ProjectWithTasksDetail: FC<
  RendererProps<ProjectWithTasksInput, unknown>
> = ({ block, input }) => {
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
