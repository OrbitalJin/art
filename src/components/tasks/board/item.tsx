import type React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import type { Task } from "@/lib/store/tasks/types";
import {
  getUnmetDependencies,
  hasUnmetDependencies,
} from "@/lib/tasks/dependency-utils";
import { toast } from "sonner";
import { CollapsibleRow } from "./item/collapsible-row";
import { UrgencyIndicator } from "./item/urgency";
import { TaskActions } from "./item/task-actions";
import { BoardItemDescription } from "./item/description";
import { useDescriptionOverflow } from "./item/use-description-overflow";
import { Energy } from "./item/energy";
import { DependenciesHoverCard } from "./item/dependencies";
import { DueBadge } from "./item/due-badge";

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
    ref: descriptionRef,
    canExpand,
    expanded,
    toggle: toggleDescription,
  } = useDescriptionOverflow(item.description ?? "");

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

  const isCompleted = item.status === "completed";
  const isCollapsedCompleted = isCompleted && !isOverlay;
  const hasDependencies = item.dependencies && item.dependencies.length > 0;
  const isBlocked =
    !isOverlay && !isCompleted && hasUnmetDependencies(item, tasks);
  const showDescriptionToggle =
    !isOverlay && canExpand && Boolean(item.description);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 150ms ease-out",
    opacity: isDragging ? 0.3 : 1,
  };

  const sortableProps =
    disabled || isOverlay ? {} : { ...attributes, ...listeners };

  const handleToggleComplete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isCompleted) {
      moveTask(item.id, "inProgress");
      return;
    }

    const unmetDeps = getUnmetDependencies(item, tasks);
    if (unmetDeps.length > 0) {
      toast.error("Cannot complete task", {
        description: `Unmet dependencies: ${unmetDeps
          .map((dependency) => dependency.title)
          .join(", ")}`,
      });
      return;
    }

    moveTask(item.id, "completed");
  };

  const handleToggleDescription = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    toggleDescription();
  };

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
          <TaskActions
            item={item}
            isBlocked={isBlocked}
            isCompleted={isCompleted}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={handleToggleComplete}
          />
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
          <BoardItemDescription
            ref={descriptionRef}
            description={item.description}
            completed={isCompleted}
            expanded={expanded}
            showFade={canExpand && !expanded}
          />
        </CollapsibleRow>
      )}

      <CollapsibleRow collapsed={isCollapsedCompleted}>
        <div className="flex items-center justify-between pt-3">
          <div className="flex flex-row items-center gap-2">
            {item.energy !== undefined ? (
              <div title={`Energy Level: ${item.energy}/5`}>
                <Energy level={item.energy} />
              </div>
            ) : null}

            {showDescriptionToggle && (
              <button
                type="button"
                aria-expanded={expanded}
                className="rounded text-[11px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleToggleDescription}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {hasDependencies && item.dependencies ? (
              <DependenciesHoverCard
                dependencies={item.dependencies}
                tasks={tasks}
              />
            ) : null}

            {item.due ? <DueBadge due={item.due} /> : null}
          </div>
        </div>
      </CollapsibleRow>
    </div>
  );
};
