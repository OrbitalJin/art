import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";

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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else {
      onClick(task);
    }
  };

  if (variant === "minimal") {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "w-1.5 h-1.5 rounded-full cursor-pointer",
          task.urgency ? urgencyColors[task.urgency] : "bg-primary",
          task.status === "completed" && "opacity-30",
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
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
};
