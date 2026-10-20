import * as React from "react";
import { format, parseISO } from "date-fns";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, Project } from "@/lib/store/tasks/types";
import { TaskField } from "./task-field";

interface DependencyOptionProps {
  title: string;
  meta: string;
  status: string;
  selected: boolean;
  onToggle: () => void;
}

const DependencyOption = ({
  title,
  meta,
  status,
  selected,
  onToggle,
}: DependencyOptionProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
      "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
      selected && "bg-accent/50",
    )}
  >
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input",
      )}
    >
      {selected && <Check className="size-3" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{title}</span>
      <span className="block truncate text-[11px] text-muted-foreground">
        {meta}
      </span>
    </span>
    <span className="shrink-0 text-[11px] text-muted-foreground">{status}</span>
  </button>
);

interface DependencyChipProps {
  title: string;
  onRemove: () => void;
}

const DependencyChip = ({ title, onRemove }: DependencyChipProps) => (
  <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
    <span className="max-w-[170px] truncate">{title}</span>
    <button
      type="button"
      aria-label={`Remove ${title}`}
      onClick={onRemove}
      className="text-muted-foreground transition-colors hover:text-destructive"
    >
      <X className="size-3" />
    </button>
  </span>
);

interface TaskDependenciesPopoverProps {
  selectedIds: string[];
  onToggle: (taskId: string) => void;
  onClear: () => void;
  tasks: Task[];
  projects: Project[];
  inboxName: string;
  currentTaskId?: string;
}

export function TaskDependenciesPopover({
  selectedIds,
  onToggle,
  onClear,
  tasks,
  projects,
  inboxName,
  currentTaskId,
}: TaskDependenciesPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const availableTasks = React.useMemo(
    () => tasks.filter((t) => t.id !== currentTaskId),
    [tasks, currentTaskId],
  );

  const selectedTasks = React.useMemo(
    () =>
      selectedIds
        .map((id) => availableTasks.find((t) => t.id === id))
        .filter((t): t is Task => Boolean(t)),
    [selectedIds, availableTasks],
  );

  const recentTasks = React.useMemo(
    () =>
      [...availableTasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 3),
    [availableTasks],
  );

  const filtered = React.useMemo(() => {
    if (!query) {
      return Array.from(
        new Map(
          [...selectedTasks, ...recentTasks].map((t) => [t.id, t]),
        ).values(),
      );
    }
    return availableTasks.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, selectedTasks, recentTasks, availableTasks]);

  const getStatusLabel = (status: Task["status"]) => {
    if (status === "inProgress") return "In Progress";
    if (status === "completed") return "Completed";
    return "Backlog";
  };

  const getProjectName = React.useCallback(
    (projectId?: string) => {
      if (!projectId) return inboxName;
      return projects.find((p) => p.id === projectId)?.name || inboxName;
    },
    [projects, inboxName],
  );

  const selectedCount = selectedTasks.length;
  const hasSelection = selectedCount > 0;

  const triggerText = !hasSelection
    ? "Tasks that must be completed first"
    : selectedCount === 1
      ? "1 task linked"
      : `${selectedCount} tasks linked`;

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <TaskField label="Dependencies">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            <span
              className={cn(
                "truncate text-left",
                !hasSelection && "text-muted-foreground",
              )}
            >
              {triggerText}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="start">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search tasks..."
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {query ? (
                  <div className="space-y-1">
                    <p>No tasks found</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      type="button"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  "No tasks available"
                )}
              </div>
            ) : (
              filtered.map((task) => {
                const isSelected = selectedIds.includes(task.id);
                const projectName = getProjectName(task.projectId);
                const dueLabel = task.due
                  ? format(parseISO(task.due), "MMM d")
                  : null;
                const meta = dueLabel
                  ? `${projectName} · ${dueLabel}`
                  : projectName;

                return (
                  <DependencyOption
                    key={task.id}
                    title={task.title}
                    meta={meta}
                    status={getStatusLabel(task.status)}
                    selected={isSelected}
                    onToggle={() => onToggle(task.id)}
                  />
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t px-3 py-1.5">
            <p className="text-xs text-muted-foreground">
              {selectedCount} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={onClear}
              disabled={!hasSelection}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasSelection && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedTasks.map((task) => (
            <DependencyChip
              key={task.id}
              title={task.title}
              onRemove={() => onToggle(task.id)}
            />
          ))}
        </div>
      )}
    </TaskField>
  );
}
