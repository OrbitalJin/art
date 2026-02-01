import type { Task } from "@/lib/store/tasks/types";
import type React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  item: Task;
  onDelete?: (id: string) => void;
  isOverlay?: boolean;
}

export const BoardItem: React.FC<Props> = ({
  item,
  onDelete,
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
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const urgencyStyles: Record<string, string> = {
    low: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
    medium:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900",
    high: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-background border border-border/60 rounded-lg p-4 shadow-sm hover:shadow-md",
        "cursor-grab active:cursor-grabbing",
        // Only animate shadow on hover, disable transitions during drag to prevent flash
        !isDragging && "transition-shadow",
        isOverlay &&
          "shadow-xl ring-2 ring-primary/20 rotate-2 cursor-grabbing scale-105",
      )}
    >
      {/* Top Row: Urgency & Actions */}
      <div className="flex items-start justify-between mb-2">
        {item.urgency ? (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 h-5",
              urgencyStyles[item.urgency],
            )}
          >
            {item.urgency}
          </Badge>
        ) : (
          <div className="h-5" /> // Spacer
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation(); // prevent drag start
              onDelete(item.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
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
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(item.due).toLocaleDateString(undefined, {
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
