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
    transition: transition || 'transform 150ms ease-out',
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
        description: `Unmet dependencies: ${unmetDeps.map((d) => d.title).join(", ")}`,
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
        "group relative overflow-hidden rounded-lg border shadow-sm",
        !transform && "transition-all duration-200",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isCompleted && "bg-muted/20",
        isCollapsedCompleted
          ? "p-3 hover:p-4 hover:shadow-md"
          : "p-4 hover:shadow-md",
        isOverlay &&
          "z-50 rotate-2 scale-105 cursor-grabbing shadow-xl ring-2 ring-primary/20",
      )}
    >
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isCollapsedCompleted
            ? "max-h-0 opacity-0 mb-0 group-hover:max-h-16 group-hover:opacity-100 group-hover:mb-3"
            : "max-h-16 opacity-100 mb-3",
        )}
      >
        <div className="flex items-start justify-between gap-2">
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

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground/40 transition-opacity",
                "hover:bg-primary/10 hover:text-primary",
              )}
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
                  className={cn(
                    "text-muted-foreground/40 transition-opacity",
                    "hover:bg-destructive/10 hover:text-destructive",
                  )}
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

            {!isOverlay && !isCompleted && hasUnmetDependencies(item, tasks) ? (
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <div className="inline-flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-muted-foreground/40 transition-colors",
                        "hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400",
                        "opacity-50 cursor-not-allowed",
                      )}
                      disabled
                    >
                      <Circle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2" side="bottom" align="center">
                  <p className="text-xs text-muted-foreground">Complete dependencies first</p>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground/40 transition-colors",
                  isCompleted
                    ? "text-green-600 hover:bg-green-500/10 hover:text-green-600 dark:text-green-400 dark:hover:text-green-400"
                    : "hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400",
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

      <div
        className={cn(
          isCollapsedCompleted ? "mb-0 mt-0" : "mb-4 mt-3 space-y-1.5",
        )}
      >
        <h4
          className={cn(
            "text-sm font-medium leading-snug text-foreground",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {item.title}
        </h4>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isCollapsedCompleted
              ? "max-h-0 opacity-0 group-hover:mt-1.5 group-hover:max-h-20 group-hover:opacity-100"
              : "max-h-20 opacity-100",
          )}
        >
          {item.description ? (
            <p
              className={cn(
                "line-clamp-2 text-xs leading-relaxed text-muted-foreground",
                isCompleted && "line-through opacity-70",
              )}
            >
              {item.description}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isCollapsedCompleted
            ? "max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100"
            : "max-h-24 opacity-100",
        )}
      >
        <div className="flex items-center justify-between border-t border-border/40 pt-3">
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
                  "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
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
        className="w-80 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
        align="end"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">
            Task Dependencies
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Complete these tasks to unblock this item.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {dependencyTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col p-2 gap-2 rounded-sm transition-all duration-200 group",
                  isCompleted
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/20",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCompleted
                        ? "text-primary line-through opacity-70"
                        : "text-foreground",
                    )}
                  >
                    {task.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 h-5 font-normal opacity-60 group-hover:opacity-100 transition-opacity capitalize",
                      isCompleted &&
                        "opacity-100 border-primary/30 text-primary",
                    )}
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-2 border-t bg-muted/10">
          <p className="text-[10px] text-muted-foreground px-1">
            {completedCount} of {dependencyTasks.length} completed
          </p>
          {completedCount === dependencyTasks.length ? (
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-600 border-none text-[10px] h-5"
            >
              Ready
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-600 border-none text-[10px] h-5"
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
