import type { FC } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  DoneNote,
  EmptyNote,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import { parseTodos, type ParsedTodo } from "./helpers";

const TodoStatusIcon: FC<{ status: string }> = ({ status }) => {
  if (status === "completed") {
    return (
      <span
        aria-hidden
        className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20"
      >
        <Check size={10} className="text-emerald-600/90 dark:text-emerald-400/90" />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "size-3.5 shrink-0 rounded-full border",
        status === "in_progress"
          ? "border-amber-500/70 shadow-[0_0_6px_rgba(245,158,11,0.4)]"
          : "border-muted-foreground/30",
      )}
    />
  );
};

const TodoRow: FC<{ todo: ParsedTodo }> = ({ todo }) => {
  const done = todo.status === "completed";
  const active = todo.status === "in_progress";

  return (
    <li className="flex min-w-0 items-start gap-2 py-1.5 first:pt-0 last:pb-0">
      <span className="mt-[3px]">
        <TodoStatusIcon status={todo.status} />
      </span>
      <span
        className={cn(
          "min-w-0 break-words text-[12px] leading-snug",
          done
            ? "text-foreground/45 line-through"
            : active
              ? "font-medium text-foreground/90"
              : "text-foreground/70",
        )}
      >
        {todo.content}
      </span>
    </li>
  );
};

export const TodoListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const todos = parseTodos(block);

  if (todos.length === 0) {
    return (
      <EmptyNote>
        {block.state === "executing" ? "Planning…" : "No plan items."}
      </EmptyNote>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <RowList maxHeightClass="max-h-64">
        {todos.map((todo, index) => (
          <TodoRow key={index} todo={todo} />
        ))}
      </RowList>
      <DoneNote block={block} />
    </div>
  );
};

export const TodoSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const todos = parseTodos(block);
  if (todos.length === 0) return null;

  const completed = todos.filter((todo) => todo.status === "completed").length;
  const allDone = completed === todos.length;
  const current = todos.find((todo) => todo.status === "in_progress");

  return (
    <SummaryRow>
      <ResultBadge tone={allDone ? "success" : "default"}>
        {completed}/{todos.length}
      </ResultBadge>
      {current ? (
        <SummaryText title={current.content}>{current.content}</SummaryText>
      ) : allDone ? (
        <SummaryText>Plan complete</SummaryText>
      ) : null}
    </SummaryRow>
  );
};
