import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  DoneNote,
  EmptyNote,
  KeyValueList,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import { asArray, asRecord, getNumber, getString } from "../../helpers";
import { inputRecord, statusLabelOf } from "./helpers";

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

export const TaskRow: FC<{ task: Record<string, unknown> }> = ({ task }) => {
  const title = getString(task, "title") ?? "Untitled task";
  const description = getString(task, "description");
  const status = getString(task, "status");
  const urgency = getString(task, "urgency");
  const energy = getNumber(task, "energy");
  const due = getString(task, "due");

  const done = status === "completed";
  const urgent = urgency === "high";

  const urgencyLabel = urgent ? (
    <span className="text-red-600/90 dark:text-red-400/90">high urgency</span>
  ) : urgency ? (
    `${urgency} urgency`
  ) : null;

  const titleClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    done ? "text-foreground/50 line-through" : "text-foreground/85",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-start gap-2">
        <StatusDot status={status} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={titleClasses}>{title}</span>
          {description ? (
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
              {description}
            </p>
          ) : null}
          <MetaLine
            items={[
              statusLabelOf(status),
              urgencyLabel,
              energy !== null ? `Energy ${energy}/5` : null,
              due ? `Due ${due}` : null,
            ]}
          />
        </div>
      </div>
    </ListRow>
  );
};

export const TaskListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const tasks = asArray(block.output);
  if (tasks.length === 0) return <EmptyNote>No tasks.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-64">
      {tasks.map((item, index) => (
        <TaskRow key={index} task={asRecord(item) ?? {}} />
      ))}
    </RowList>
  );
};

export const SingleTaskDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const task = asRecord(block.output);
  if (!task) return <EmptyNote>Task not found.</EmptyNote>;

  return (
    <RowList>
      <TaskRow task={task} />
    </RowList>
  );
};

export const TaskFields: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = inputRecord(block);
  const description = getString(input, "description");
  const status = getString(input, "status");
  const urgency = getString(input, "urgency");
  const energy = getNumber(input, "energy");
  const due = getString(input, "due");

  const entries: { label: string; value: ReactNode }[] = [];
  if (description) entries.push({ label: "Description", value: description });
  if (status) entries.push({ label: "Status", value: statusLabelOf(status) });
  if (urgency) entries.push({ label: "Urgency", value: urgency });
  if (energy !== null) entries.push({ label: "Energy", value: `${energy}/5` });
  if (due) entries.push({ label: "Due", value: due });

  return (
    <div className="flex flex-col gap-2.5">
      {entries.length > 0 ? <KeyValueList entries={entries} /> : null}
      <DoneNote block={block} />
    </div>
  );
};

export const MoveTaskDetail: FC<{ block: ToolCallBlock }> = ({ block }) =>
  block.state === "result" ? (
    <DoneNote block={block} />
  ) : (
    <EmptyNote>Moving…</EmptyNote>
  );

export const DeletedDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DoneNote block={block} label="Deleted" />
);

export const ProjectListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const projects = asArray(block.output);
  if (projects.length === 0) return <EmptyNote>No projects.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-56">
      {projects.map((item, index) => (
        <ListRow key={index}>
          <span className="truncate text-[12px] text-foreground/85">
            {getString(asRecord(item), "name") ?? "Project"}
          </span>
        </ListRow>
      ))}
    </RowList>
  );
};

export const ProjectWithTasksDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const input = inputRecord(block);
  const name = getString(asRecord(input?.project), "name");
  const titles = asArray(input?.tasks)
    .map((task) => getString(asRecord(task), "title"))
    .filter((title): title is string => title !== null);

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
