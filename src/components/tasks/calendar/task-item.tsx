import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";
import { Link } from "lucide-react";
import { useTasksStore } from "@/lib/store/use-tasks-store";

const urgencyColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
  variant?: "minimal" | "full";
}

export const TaskItem = ({
  task,
  onClick,
  onEdit,
  variant = "full",
}: TaskItemProps) => {
  const tasks = useTasksStore((state) => state.tasks);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else {
      onClick(task);
    }
  };

  const dependencyIds = task.dependencies ?? [];
  const hasDependencies = dependencyIds.length > 0;
  const completedDeps = tasks.filter(
    (t) => dependencyIds.includes(t.id) && t.status === "completed",
  ).length;
  const allDepsCompleted =
    hasDependencies && completedDeps === dependencyIds.length;

  const dotColor = task.urgency ? urgencyColors[task.urgency] : "bg-primary";
  const isCompleted = task.status === "completed";

  if (variant === "minimal") {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "relative size-1.5 cursor-pointer rounded-full",
          dotColor,
          isCompleted && "opacity-30",
          hasDependencies && "ring-1 ring-amber-500/50 ring-offset-1",
        )}
      />
    );
  }

  const depTone = allDepsCompleted
    ? "text-green-600 dark:text-green-400"
    : "text-amber-600 dark:text-amber-400";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full truncate rounded-lg bg-background/70 px-2 py-1.5 text-left text-xs transition-colors hover:bg-background",
        isCompleted && "opacity-60 line-through",
      )}
    >
      <div className="flex items-center gap-2">
        {task.urgency && (
          <div className={cn("size-1.5 shrink-0 rounded-full", dotColor)} />
        )}
        {hasDependencies && <Link className={cn("size-3 shrink-0", depTone)} />}
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
};
