import type { Task } from "@/lib/store/tasks/types";
import type React from "react";
import { addDays, isBefore, isSameDay, startOfDay } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Frown,
  Link,
  Meh,
  Pencil,
  Smile,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  getUnmetDependencies,
  hasUnmetDependencies,
} from "@/lib/tasks/dependency-utils";
import { toast } from "sonner";

interface Props {
  item: Task;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  isOverlay?: boolean;
  disabled?: boolean;
}

export const BoardItem: React.FC<Props> = ({
  item,
  onDelete,
  onEdit,
  isOverlay = false,
  disabled = false,
}) => {
  const moveTask = useTasksStore((state) => state.moveTask);
  const tasks = useTasksStore((state) => state.tasks);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled,
    transition: {
      duration: 150,
      easing: "ease-out",
    },
    data: {
      type: "task",
      task: item,
      status: item.status,
    },
  });

  const today = startOfDay(new Date());
  const dueDate = item.due ? startOfDay(new Date(item.due)) : null;

  const isOverDue = dueDate ? isBefore(dueDate, today) : false;
  const isDueToday = dueDate ? isSameDay(dueDate, today) : false;
  const isDueTomorrow = dueDate ? isSameDay(dueDate, addDays(today, 1)) : false;
  const isCompleted = item.status === "completed";
  const isCollapsedCompleted = isCompleted && !isOverlay;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 150ms ease-out",
    opacity: isDragging ? 0.3 : 1,
  };

  const urgencyStyles: Record<string, string> = {
    low: cn(
      "border-green-200 bg-green-50 text-green-600",
      "dark:border-green-900 dark:bg-green-900/20",
    ),
    medium: cn(
      "border-amber-200 bg-amber-100/80 text-amber-700",
      "dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    ),
    high: cn(
      "border-red-200 bg-red-100/80 text-red-700",
      "dark:border-red-800 dark:bg-red-900/40 dark:text-red-400",
    ),
  };

  const sortableProps =
    disabled || isOverlay ? {} : { ...attributes, ...listeners };

  const handleToggleComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isCompleted) {
      moveTask(item.id, "inProgress");
      return;
    }

    const unmetDeps = getUnmetDependencies(item, tasks);
    if (unmetDeps.length > 0) {
      toast.error("Cannot complete task", {
        description: `Unmet dependencies: ${unmetDeps
          .map((d) => d.title)
          .join(", ")}`,
      });
      return;
    }

    moveTask(item.id, "completed");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...sortableProps}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-background p-4 shadow-sm transition-all duration-300",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isCompleted && "bg-muted/20",
        isOverlay &&
          "z-50 rotate-2 scale-105 cursor-grabbing shadow-xl ring-2 ring-primary/20",
      )}
    >
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isCollapsedCompleted
            ? "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100"
            : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {item.urgency ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 border px-1 py-0.5 pr-2 text-xs",
                    urgencyStyles[item.urgency],
                  )}
                >
                  {item.urgency === "low" ? (
                    <Smile className="h-3 w-3" />
                  ) : item.urgency === "medium" ? (
                    <Meh className="h-3 w-3" />
                  ) : (
                    <Frown className="h-3 w-3" />
                  )}
                  {item.urgency}
                </Badge>
              ) : (
                <div className="h-5" />
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/40 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item.id);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {!isOverlay &&
              !isCompleted &&
              hasUnmetDependencies(item, tasks) ? (
                <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div className="inline-flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 cursor-not-allowed text-muted-foreground/40 opacity-50"
                        disabled
                      >
                        <Circle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-2" side="bottom">
                    <p className="text-xs text-muted-foreground">
                      Complete dependencies first
                    </p>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 text-muted-foreground/40 transition-colors",
                    isCompleted
                      ? "text-green-600 hover:bg-green-500/10 dark:text-green-400"
                      : "hover:bg-green-500/10 hover:text-green-600",
                  )}
                  onClick={handleToggleComplete}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Always Visible Title, Collapsible Description) */}
      <div className="space-y-1.5">
        <h4
          className={cn(
            "text-sm font-medium leading-snug text-foreground transition-all duration-300",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {item.title}
        </h4>

        {item.description && (
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isCollapsedCompleted
                ? "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100"
                : "grid-rows-[1fr] opacity-100",
            )}
          >
            <div className="overflow-hidden">
              <p
                className={cn(
                  "pt-1 text-xs leading-relaxed text-muted-foreground transition-all duration-300",
                  isCompleted && "opacity-70 line-through",
                )}
              >
                {item.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. FOOTER SECTION (Collapsible) */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isCollapsedCompleted
            ? "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100"
            : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-3">
              {item.energy !== undefined ? (
                <div title={`Energy Level: ${item.energy}/5`}>
                  <Energy level={item.energy} />
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {item.dependencies && item.dependencies.length > 0 && (
                <DependenciesHoverCard
                  dependencies={item.dependencies}
                  tasks={tasks}
                />
              )}

              {item.due ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-300",
                    "border-transparent bg-muted/30 text-muted-foreground",
                    (isDueTomorrow || isDueToday) && urgencyStyles.medium,
                    isOverDue && urgencyStyles.high,
                  )}
                >
                  {isOverDue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : isDueTomorrow || isDueToday ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}

                  <span>
                    {isOverDue && "Overdue: "}
                    {isDueToday
                      ? "Today"
                      : isDueTomorrow
                        ? "Tomorrow"
                        : new Date(item.due).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DependenciesHoverCard = ({
  dependencies,
  tasks,
}: {
  dependencies: string[];
  tasks: Task[];
}) => {
  const dependencyTasks = dependencies
    .map((depId) => tasks.find((t) => t.id === depId))
    .filter((t): t is Task => Boolean(t));

  const completedCount = dependencyTasks.filter(
    (t) => t.status === "completed",
  ).length;

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "flex cursor-default items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
            "border-transparent bg-muted/30 text-muted-foreground transition-all hover:bg-muted/50",
          )}
        >
          <Link className="h-3 w-3" />
          <span>
            {completedCount}/{dependencyTasks.length}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
        align="end"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">
            Task Dependencies
          </p>
          <p className="leading-tight text-[11px] text-muted-foreground">
            Complete these tasks to unblock this item.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-2">
          {dependencyTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className={cn(
                  "group flex flex-col gap-2 rounded-sm p-2 transition-all duration-200",
                  isCompleted
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/20",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      isCompleted
                        ? "text-primary opacity-70 line-through"
                        : "text-foreground",
                    )}
                  >
                    {task.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 py-0 text-[10px] font-normal capitalize opacity-60 transition-opacity group-hover:opacity-100",
                      isCompleted &&
                        "border-primary/30 text-primary opacity-100",
                    )}
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/10 p-2">
          <p className="px-1 text-[10px] text-muted-foreground">
            {completedCount} of {dependencyTasks.length} completed
          </p>
          {completedCount === dependencyTasks.length ? (
            <Badge
              variant="secondary"
              className="h-5 border-none bg-green-500/10 text-[10px] text-green-600"
            >
              Ready
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="h-5 border-none bg-amber-500/10 text-[10px] text-amber-600"
            >
              Blocked
            </Badge>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const Energy = ({ level }: { level: number }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Zap
          key={i}
          fill={i < level ? "currentColor" : "none"}
          className={cn(
            "h-3 w-3",
            i < level
              ? "text-yellow-500/80 dark:text-yellow-400"
              : "text-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
};
