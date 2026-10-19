import type React from "react";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";
import { Button } from "@/components/ui/button";
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

interface Props {
  item: Task;
  isBlocked: boolean;
  isCompleted: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onToggleComplete: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TaskActions = ({
  item,
  isBlocked,
  isCompleted,
  onEdit,
  onDelete,
  onToggleComplete,
}: Props) => (
  <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
    <Button
      variant="ghost"
      size="icon"
      className="size-7 rounded-full text-muted-foreground/50 hover:bg-primary/10 hover:text-primary"
      onClick={(event) => {
        event.stopPropagation();
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
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        size="sm"
        onClick={(event) => event.stopPropagation()}
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
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(item.id);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {isBlocked ? (
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
        onClick={onToggleComplete}
      >
        {isCompleted ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <Circle className="size-3.5" />
        )}
      </Button>
    )}
  </div>
);
