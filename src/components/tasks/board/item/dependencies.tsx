import { Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Task } from "@/lib/store/tasks/types";

interface Props {
  dependencies: string[];
  tasks: Task[];
}

export const DependenciesHoverCard = ({ dependencies, tasks }: Props) => {
  const dependencyTasks = dependencies
    .map((depId) => tasks.find((t) => t.id === depId))
    .filter((t): t is Task => Boolean(t));

  const completedCount = dependencyTasks.filter(
    (t) => t.status === "completed",
  ).length;

  const isReady = completedCount === dependencyTasks.length;

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <div className="flex cursor-default items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/70">
          <Link className="size-3" />
          <span>
            {completedCount}/{dependencyTasks.length}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 overflow-hidden rounded-xl border-none p-0 shadow-xl ring-1 ring-border"
        align="end"
      >
        <div className="px-4 pb-2 pt-3">
          <p className="text-sm font-medium text-foreground">Dependencies</p>
          <p className="text-[11px] text-muted-foreground">
            Complete these tasks to unblock this item.
          </p>
        </div>

        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {dependencyTasks.map((task) => {
            const isDepCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                <p
                  className={cn(
                    "truncate text-sm",
                    isDepCompleted
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {task.title}
                </p>
                <span className="shrink-0 text-[10px] capitalize text-muted-foreground">
                  {task.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
          <p className="text-[11px] text-muted-foreground">
            {completedCount} of {dependencyTasks.length} completed
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 rounded-full border-none text-[10px]",
              isReady
                ? "bg-green-500/10 text-green-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            {isReady ? "Ready" : "Blocked"}
          </Badge>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
