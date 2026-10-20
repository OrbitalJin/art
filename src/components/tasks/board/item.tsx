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

interface DescriptionToggleProps {
  expanded: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const DescriptionToggle = ({ expanded, onToggle }: DescriptionToggleProps) => {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      className={cn(
        "rounded text-[11px] font-medium text-muted-foreground/70",
        "transition-colors hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onToggle}
    >
      {expanded ? "Show less" : "Show more"}
    </button>
  );
};

interface EnergyMeterProps {
  level: number;
}

const EnergyMeter = ({ level }: EnergyMeterProps) => {
  return (
    <div title={`Energy Level: ${level}/5`}>
      <Energy level={level} />
    </div>
  );
};

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

  const dependencyIds = item.dependencies ?? [];
  const hasDependencies = dependencyIds.length > 0;
  const hasEnergy = item.energy !== undefined;
  const hasDue = Boolean(item.due);

  const isCompleted = item.status === "completed";
  const isCollapsedCompleted = isCompleted && !isOverlay;
  const isBlocked =
    !isOverlay && !isCompleted && hasUnmetDependencies(item, tasks);
  const showDescriptionToggle =
    !isOverlay && canExpand && Boolean(item.description);

  const hasFooter =
    hasEnergy || showDescriptionToggle || hasDependencies || hasDue;

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
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card p-3.5",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "hover:border-foreground/20 hover:shadow-sm",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isCompleted && "border-border/40 bg-muted/30 hover:shadow-none",
        isOverlay &&
          "z-50 scale-[1.02] cursor-grabbing border-primary/40 shadow-lg",
      )}
    >
      <CollapsibleRow collapsed={isCollapsedCompleted}>
        <div className="mb-2 flex min-h-6 items-center justify-between gap-2">
          <UrgencyIndicator urgency={item.urgency} />
          <div
            className={cn(
              "transition-opacity duration-150",
              "md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100",
              isOverlay && "md:opacity-100",
            )}
          >
            <TaskActions
              item={item}
              isBlocked={isBlocked}
              isCompleted={isCompleted}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>
      </CollapsibleRow>

      <h4
        className={cn(
          "text-sm font-medium leading-snug tracking-tight text-foreground",
          "transition-colors duration-200",
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

      {hasFooter && (
        <CollapsibleRow collapsed={isCollapsedCompleted}>
          <div className="flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-2">
              {hasEnergy && item.energy !== undefined ? (
                <EnergyMeter level={item.energy} />
              ) : null}

              {showDescriptionToggle && (
                <DescriptionToggle
                  expanded={expanded}
                  onToggle={handleToggleDescription}
                />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {hasDependencies ? (
                <DependenciesHoverCard
                  dependencies={dependencyIds}
                  tasks={tasks}
                />
              ) : null}

              {item.due ? <DueBadge due={item.due} /> : null}
            </div>
          </div>
        </CollapsibleRow>
      )}
    </div>
  );
};
