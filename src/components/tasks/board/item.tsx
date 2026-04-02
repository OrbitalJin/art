import type { Task } from "@/lib/store/tasks/types";
import type React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Trash2,
  Zap,
  AlertCircle,
  Clock,
  Smile,
  Frown,
  Meh,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, isSameDay, startOfDay, isBefore } from "date-fns";
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

interface Props {
  item: Task;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  isOverlay?: boolean;
}

export const BoardItem: React.FC<Props> = ({
  item,
  onDelete,
  onEdit,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    transition: {
      duration: 150,
      easing: "ease-out",
    },
  });

  const today = startOfDay(new Date());
  const dueDate = item.due ? startOfDay(new Date(item.due)) : null;

  const isOverDue = dueDate ? isBefore(dueDate, today) : false;
  const isDueToday = dueDate ? isSameDay(dueDate, today) : false;
  const isDueTomorrow = dueDate ? isSameDay(dueDate, addDays(today, 1)) : false;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  const urgencyStyles: Record<string, string> = {
    low: cn(
      "text-green-600 bg-green-50 border-green-200",
      "dark:bg-green-900/20 dark:border-green-900",
    ),
    medium: cn(
      "text-amber-700 bg-amber-100/80 border-amber-200",
      "dark:text-amber-400 dark:bg-amber-900/40 dark:border-amber-800",
    ),
    high: cn(
      "text-red-700 bg-red-100/80 border-red-200",
      "dark:text-red-400 dark:bg-red-900/40 dark:border-red-800",
    ),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-lg p-4 shadow-sm hover:shadow-md border",
        "cursor-grab active:cursor-grabbing",
        !transform && "transition-shadow duration-200",
        isOverlay &&
          "shadow-xl ring-2 ring-primary/20 rotate-2 cursor-grabbing scale-105 z-50",
      )}
    >
      {/* Top Row: Urgency & Actions */}
      <div className="flex items-start justify-between">
        {item.urgency ? (
          <Badge
            variant="outline"
            className={cn(
              "text-xs border px-1 py-0.5 gap-1 pr-2",
              urgencyStyles[item.urgency],
            )}
          >
            {item.urgency === "low" ? (
              <Smile className="w-3 h-3" />
            ) : item.urgency === "medium" ? (
              <Meh className="w-3 h-3" />
            ) : (
              <Frown className="w-3 h-3" />
            )}
            {item.urgency}
          </Badge>
        ) : (
          <div className="h-5" />
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-muted-foreground/40 hover:text-primary",
              "hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity",
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!onEdit) return;
              onEdit(item);
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground/40 hover:text-destructive",
                  "hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity",
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
                    if (!onDelete) return;
                    onDelete(item.id);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-1.5 mb-4">
        <h4 className="font-medium text-sm leading-snug text-foreground">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer: Energy & Date */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-3">
          {item.energy !== undefined && (
            <div title={`Energy Level: ${item.energy}/5`}>
              <Energy level={item.energy} />
            </div>
          )}
        </div>

        {item.due && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border",
              "text-muted-foreground bg-muted/30 border-transparent",
              (isDueTomorrow || isDueToday) && urgencyStyles["medium"],
              isOverDue && urgencyStyles["high"],
            )}
          >
            {isOverDue ? (
              <AlertCircle className="w-3 h-3" />
            ) : isDueTomorrow || isDueToday ? (
              <Clock className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
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
        )}
      </div>
    </div>
  );
};

const Energy = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Zap
        key={i}
        fill={i < level ? "currentColor" : "none"}
        className={cn(
          "w-3 h-3",
          i < level
            ? "text-yellow-500/80 dark:text-yellow-400"
            : "text-muted-foreground/20",
        )}
      />
    ))}
  </div>
);
