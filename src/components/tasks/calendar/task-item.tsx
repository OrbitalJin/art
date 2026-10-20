import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/store/tasks/types";
import { Lock } from "lucide-react";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import { Checkbox } from "@/components/ui/checkbox";

interface UrgencyDotProps {
  urgency: Task["urgency"];
}

const UrgencyDot = ({ urgency }: UrgencyDotProps) => {
  if (!urgency) return null;

  const isLow = urgency === "low";
  const isMedium = urgency === "medium";
  const isHigh = urgency === "high";

  return (
    <span
      title={`${urgency} urgency`}
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        isLow && "bg-green-500",
        isMedium && "bg-amber-500",
        isHigh && "bg-red-500",
      )}
    />
  );
};

interface DependencyBadgeProps {
  completed: number;
  total: number;
  allCompleted: boolean;
}

const DependencyBadge = ({
  completed,
  total,
  allCompleted,
}: DependencyBadgeProps) => {
  const tone = allCompleted
    ? "text-green-600 dark:text-green-400"
    : "text-muted-foreground";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 text-[11px] tabular-nums",
        tone,
      )}
    >
      <Lock size={11} />
      {completed}/{total}
    </span>
  );
};

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  variant?: "minimal" | "full";
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
  const tasks = useTasksStore((state) => state.tasks);
  const updateTask = useTasksStore((state) => state.updateTask);
  const setStatus = (status: TaskStatus) =>
    updateTask(task.id, {
      status: status,
    });

  const dependencyIds = task.dependencies ?? [];
  const hasDependencies = dependencyIds.length > 0;
  const completedDeps = tasks.filter(
    (t) => dependencyIds.includes(t.id) && t.status === "completed",
  ).length;
  const allDepsCompleted =
    hasDependencies && completedDeps === dependencyIds.length;

  const isCompleted = task.status === "completed";

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2",
        "border border-transparent bg-card/60 text-sm shadow-xs",
        "transition-colors hover:border-border hover:bg-card",
      )}
    >
      <div className="flex size-4 shrink-0 items-center justify-center">
        <Checkbox
          checked={isCompleted}
          disabled={hasDependencies && !allDepsCompleted}
          onCheckedChange={(s: boolean) =>
            setStatus(s ? "completed" : "backlog")
          }
        />
      </div>

      <button
        type="button"
        onClick={() => onClick(task)}
        className="min-w-0 flex-1 cursor-pointer truncate text-left outline-none"
      >
        <span
          className={cn(
            "truncate",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
      </button>

      {hasDependencies && (
        <DependencyBadge
          completed={completedDeps}
          total={dependencyIds.length}
          allCompleted={allDepsCompleted}
        />
      )}

      <UrgencyDot urgency={task.urgency} />
    </div>
  );
};
