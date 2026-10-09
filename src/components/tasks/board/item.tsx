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
  Link,
  Pencil,
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
  const hasDependencies = item.dependencies && item.dependencies.length > 0;
  const isBlocked =
    !isOverlay && !isCompleted && hasUnmetDependencies(item, tasks);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 150ms ease-out",
    opacity: isDragging ? 0.3 : 1,
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

  const dueLabel = isDueToday
    ? "Today"
    : isDueTomorrow
      ? "Tomorrow"
      : item.due
        ? new Date(item.due).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";

  const dueTone = isOverDue
    ? "bg-red-500/10 text-red-600 dark:text-red-400"
    : isDueToday || isDueTomorrow
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-muted text-muted-foreground";

  const dueIcon = isOverDue ? (
    <AlertCircle className="size-3" />
  ) : isDueToday || isDueTomorrow ? (
    <Clock className="size-3" />
  ) : (
    <Calendar className="size-3" />
  );

  const completeButton = isBlocked ? (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className="inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 cursor-not-allowed rounded-full text-muted-foreground/40 opacity-50"
            disabled
          >
            <Circle className="size-3.5" />
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-auto rounded-lg border-none p-2 shadow-lg ring-1 ring-border"
        side="bottom"
      >
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
        "size-7 rounded-full text-muted-foreground/50 transition-colors",
        isCompleted
          ? "text-green-600 hover:bg-green-500/10 dark:text-green-400"
          : "hover:bg-green-500/10 hover:text-green-600",
      )}
      onClick={handleToggleComplete}
    >
      {isCompleted ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <Circle className="size-3.5" />
      )}
    </Button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...sortableProps}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-background p-3.5 shadow-sm ring-1 ring-border transition-all duration-300",
        "hover:shadow-md hover:ring-foreground/15",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isCompleted && "bg-background/60 shadow-none ring-border/60",
        isOverlay &&
          "z-50 scale-[1.02] cursor-grabbing shadow-xl ring-primary/40",
      )}
    >
      <CollapsibleRow collapsed={isCollapsedCompleted}>
        <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
          <UrgencyIndicator urgency={item.urgency} />

          <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground/50 hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(item);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
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

            {completeButton}
          </div>
        </div>
      </CollapsibleRow>

      <h4
        className={cn(
          "text-sm font-medium leading-snug text-foreground transition-all duration-300",
          isCompleted && "text-muted-foreground line-through",
        )}
      >
        {item.title}
      </h4>

      {item.description && (
        <CollapsibleRow collapsed={isCollapsedCompleted}>
          <p
            className={cn(
              "pt-1 text-xs leading-relaxed text-muted-foreground",
              isCompleted && "opacity-70 line-through",
            )}
          >
            {item.description}
          </p>
        </CollapsibleRow>
      )}

      <CollapsibleRow collapsed={isCollapsedCompleted}>
        <div className="flex items-center justify-between pt-3">
          <div title={`Energy Level: ${item.energy}/5`}>
            {item.energy !== undefined ? <Energy level={item.energy} /> : null}
          </div>

          <div className="flex items-center gap-1.5">
            {hasDependencies && item.dependencies ? (
              <DependenciesHoverCard
                dependencies={item.dependencies}
                tasks={tasks}
              />
            ) : null}

            {item.due ? (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  dueTone,
                )}
              >
                {dueIcon}
                <span>
                  {isOverDue && "Overdue · "}
                  {dueLabel}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </CollapsibleRow>
    </div>
  );
};

const CollapsibleRow = ({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) => {
  const collapseStyle = collapsed
    ? "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100"
    : "grid-rows-[1fr] opacity-100";

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        collapseStyle,
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
};

const UrgencyDot = ({ dot, label }: { dot: string; label: string }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-medium capitalize text-muted-foreground">
    <span className={cn("size-1.5 rounded-full", dot)} />
    {label}
  </div>
);

const UrgencyIndicator = ({ urgency }: { urgency: Task["urgency"] }) => {
  if (urgency === "low") return <UrgencyDot dot="bg-green-500" label="low" />;
  if (urgency === "medium")
    return <UrgencyDot dot="bg-amber-500" label="medium" />;
  if (urgency === "high") return <UrgencyDot dot="bg-red-500" label="high" />;
  return <div className="h-5" />;
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

  const isReady = completedCount === dependencyTasks.length;

  const statusBadge = isReady ? (
    <Badge
      variant="secondary"
      className="h-5 rounded-full border-none bg-green-500/10 text-[10px] text-green-600"
    >
      Ready
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="h-5 rounded-full border-none bg-amber-500/10 text-[10px] text-amber-600"
    >
      Blocked
    </Badge>
  );

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
          {statusBadge}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const EnergyBolt = ({ filled }: { filled: boolean }) => {
  const tone = filled
    ? "text-yellow-500/80 dark:text-yellow-400"
    : "text-muted-foreground/20";

  return (
    <Zap
      fill={filled ? "currentColor" : "none"}
      className={cn("size-3", tone)}
    />
  );
};

const Energy = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    <EnergyBolt filled={level >= 1} />
    <EnergyBolt filled={level >= 2} />
    <EnergyBolt filled={level >= 3} />
    <EnergyBolt filled={level >= 4} />
    <EnergyBolt filled={level >= 5} />
  </div>
);
