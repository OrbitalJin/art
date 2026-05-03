import * as React from "react";
import { format, parseISO } from "date-fns";
import { Link, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, Project } from "@/lib/store/tasks/types";

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

  const triggerText = React.useMemo(() => {
    if (selectedTasks.length === 0) return "Link dependent tasks...";
    if (selectedTasks.length <= 2)
      return selectedTasks.map((t) => t.title).join(", ");
    return `${selectedTasks.length} task(s) linked`;
  }, [selectedTasks]);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <div className="col-span-2 space-y-2">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link className="h-3 w-3" />
        Dependencies
      </label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative w-full justify-start">
            <Link className="mr-2 h-4 w-4" />
            <span className="truncate text-left">{triggerText}</span>

            {selectedTasks.length > 0 && (
              <span
                className="
                  absolute -top-1 -right-1 flex h-4 min-w-4 items-center
                  justify-center rounded-full bg-primary px-1
                  text-[10px] text-primary-foreground
                "
              >
                {selectedTasks.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80 border-muted-foreground/20 p-0 shadow-xl"
          align="start"
        >
          <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
            <p className="text-sm font-medium">Task dependencies</p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Select tasks that must be completed first.
            </p>
          </div>

          <div className="border-b p-2">
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search tasks..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
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

                return (
                  <div
                    key={task.id}
                    onClick={() => onToggle(task.id)}
                    className={cn(
                      "group flex cursor-pointer flex-col gap-2 rounded-sm p-2 transition-all duration-200",
                      isSelected
                        ? "bg-primary/5 text-primary-foreground ring-1 ring-primary/20"
                        : "hover:bg-accent/20 hover:text-accent-foreground",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {task.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 py-0 text-[10px] font-normal opacity-60 transition-opacity group-hover:opacity-100",
                          isSelected &&
                            "border-primary/30 text-primary opacity-100",
                        )}
                      >
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[11px] text-muted-foreground/70">
                        {getProjectName(task.projectId)}
                      </p>
                      {task.due ? (
                        <p className="shrink-0 text-[11px] text-muted-foreground/70">
                          {format(parseISO(task.due), "MMM d")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-muted/10 p-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              onClick={onClear}
              disabled={selectedTasks.length === 0}
            >
              Clear selection
            </Button>
            <p className="px-2 text-[10px] text-muted-foreground">
              {selectedTasks.length} selected
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedTasks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                "border-border/60 bg-muted/40",
              )}
            >
              <span className="max-w-[170px] truncate">{task.title}</span>
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
