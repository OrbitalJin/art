import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  EmptyNote,
  ErrorNote,
  ResultBadge,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import { parseTodos, type ParsedTodo, type TodoStatus } from "./helpers";

const STATUS_LABEL: Record<TodoStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

const countCompleted = (todos: ParsedTodo[]): number =>
  todos.filter((todo) => todo.status === "completed").length;

const StatusMarker: FC<{ status: TodoStatus }> = ({ status }) => {
  const dotClasses = cn(
    "size-1.5 rounded-full",
    status === "completed" && "bg-emerald-500",
    status === "in_progress" &&
      "animate-pulse bg-amber-500 motion-reduce:animate-none",
    status === "pending" && "bg-muted-foreground/25",
  );

  return (
    <span
      aria-hidden
      className="flex h-[18px] w-3 shrink-0 items-center justify-center"
    >
      <span className={dotClasses} />
    </span>
  );
};

const TodoRow: FC<{ todo: ParsedTodo }> = ({ todo }) => {
  const done = todo.status === "completed";
  const active = todo.status === "in_progress";

  const rowClasses = cn(
    "flex min-w-0 items-start gap-2 rounded-md px-2 py-1.5",
    active && "bg-amber-500/5",
  );

  const textClasses = cn(
    "min-w-0 text-[12px] leading-[18px] break-words",
    done && "text-foreground/45 line-through",
    active && "font-medium text-foreground/90",
    !done && !active && "text-foreground/70",
  );

  return (
    <li className={rowClasses}>
      <StatusMarker status={todo.status} />
      <span className={textClasses}>
        <span className="sr-only">{STATUS_LABEL[todo.status]}: </span>
        {todo.content}
      </span>
    </li>
  );
};

const ProgressBar: FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total;

  const fillClasses = cn(
    "h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
    allDone ? "bg-emerald-500/70" : "bg-amber-500/70",
  );

  return (
    <div
      role="progressbar"
      aria-label="Plan progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      className="h-1 overflow-hidden rounded-full bg-muted/70"
    >
      <div className={fillClasses} style={{ width: `${percent}%` }} />
    </div>
  );
};

export const TodoListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "error") {
    return <ErrorNote>Couldn't update the plan.</ErrorNote>;
  }

  const todos = parseTodos(block);

  if (todos.length === 0) {
    return (
      <EmptyNote>
        {block.state === "executing" ? "Planning…" : "No plan items."}
      </EmptyNote>
    );
  }

  const completed = countCompleted(todos);
  const allDone = completed === todos.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <p className="flex items-baseline justify-between text-[11px] text-muted-foreground/70 tabular-nums">
          <span>{allDone ? "All done" : "Plan"}</span>
          <span>
            {completed} of {todos.length}
          </span>
        </p>
        <ProgressBar completed={completed} total={todos.length} />
      </div>

      <ol className="-mx-2 flex max-h-72 flex-col gap-0.5 overflow-auto">
        {todos.map((todo, index) => (
          <TodoRow key={index} todo={todo} />
        ))}
      </ol>
    </div>
  );
};

export const TodoSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const todos = parseTodos(block);
  const failed = block.state === "error";

  if (todos.length === 0 && !failed) return null;

  const completed = countCompleted(todos);
  const allDone = todos.length > 0 && completed === todos.length;
  const focus =
    todos.find((todo) => todo.status === "in_progress") ??
    todos.find((todo) => todo.status !== "completed");
  const label = allDone ? "Plan complete" : (focus?.content ?? null);

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      {failed ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : (
        <ResultBadge tone={allDone ? "success" : "default"}>
          {completed}/{todos.length}
        </ResultBadge>
      )}
    </SummaryRow>
  );
};
