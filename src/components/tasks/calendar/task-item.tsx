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

  const hasDependencies = task.dependencies && task.dependencies.length > 0;
  const dependencyTasks = hasDependencies
    ? tasks.filter((t) => task.dependencies!.includes(t.id))
    : [];
  const completedDeps = dependencyTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const allDepsCompleted =
    hasDependencies && completedDeps === task.dependencies!.length;

  if (variant === "minimal") {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "w-1.5 h-1.5 rounded-full cursor-pointer relative",
          task.urgency ? urgencyColors[task.urgency] : "bg-primary",
          task.status === "completed" && "opacity-30",
          hasDependencies && "ring-1 ring-offset-1 ring-amber-500/50",
        )}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "text-left text-xs px-2 py-2 rounded border truncate transition-colors hover:bg-accent w-full",
        task.status === "completed" && "opacity-60 line-through",
      )}
    >
      <div className="flex items-center gap-2">
        {task.urgency && (
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              urgencyColors[task.urgency],
            )}
          />
        )}
        {hasDependencies && (
          <Link
            className={cn(
              "h-3 w-3 shrink-0",
              allDepsCompleted
                ? "text-green-600 dark:text-green-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          />
        )}
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
};
