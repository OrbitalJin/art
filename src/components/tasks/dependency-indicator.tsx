import { Link, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DependencyIndicatorProps {
  taskId: string;
  dependencies: string[];
  tasks: Task[];
  variant?: "icon" | "badge";
}

export const DependencyIndicator = ({
  dependencies,
  tasks,
  variant = "badge",
}: DependencyIndicatorProps) => {
  const dependencyTasks = tasks.filter((t) => dependencies.includes(t.id));
  const completedCount = dependencyTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const totalCount = dependencies.length;
  const allCompleted = completedCount === totalCount;

  if (totalCount === 0) return null;

  const getDependencyColor = () => {
    if (allCompleted) return "text-green-600 dark:text-green-400";
    return "text-amber-600 dark:text-amber-400";
  };

  const tooltipContent = (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">Dependencies ({completedCount}/{totalCount} completed):</p>
      {dependencyTasks.map((dep) => (
        <div key={dep.id} className="flex items-center gap-1.5 text-xs">
          {dep.status === "completed" ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Circle className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={cn(dep.status === "completed" && "line-through opacity-70")}>
            {dep.title}
          </span>
        </div>
      ))}
    </div>
  );

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", getDependencyColor())}>
            <Link className="h-3 w-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipContent}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
            allCompleted
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
          )}
        >
          <Link className="h-3 w-3" />
          <span>
            {completedCount}/{totalCount}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};
