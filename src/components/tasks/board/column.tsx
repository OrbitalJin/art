import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowDownUp,
  ArrowUpDown,
  Calendar,
  Lock,
  TriangleAlert,
  Type,
  X,
  Zap,
} from "lucide-react";
import type { Task } from "@/lib/store/tasks/types";
import { useTaskSorting } from "@/hooks/use-task-sorting";
import { cn } from "@/lib/utils";
import { BoardItem } from "./item";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  id: string;
  title: string;
  items: Task[];
  overId: string | null;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { field: "title" as const, label: "Title", icon: Type },
  { field: "urgency" as const, label: "Urgency", icon: TriangleAlert },
  { field: "due" as const, label: "Due Date", icon: Calendar },
  { field: "energy" as const, label: "Energy", icon: Zap },
];

export const BoardColumn: React.FC<Props> = ({
  id,
  title,
  items,
  overId,
  onDelete,
  onEdit,
  className,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const { sortedItems, sortConfig, setSortConfig, handleSort, isManualOrder } =
    useTaskSorting(items);

  const isOverColumn =
    isOver || (overId !== null && items.some((item) => item.id === overId));

  const activeSortOption = SORT_OPTIONS.find(
    (opt) => opt.field === sortConfig?.field,
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-1 flex-col rounded-md border border-border bg-background transition-colors md:min-h-0",
        isOverColumn && "border-primary bg-primary/5",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between border-b border-border px-3 py-2">
        <div className="flex flex-row items-center gap-2 overflow-hidden">
          <p className="truncate font-medium">{title}</p>
          <span className="text-sm text-muted-foreground shrink-0">
            ({items.length})
          </span>

          {!isManualOrder && (
            <HoverCard openDelay={200} closeDelay={150}>
              <HoverCardTrigger asChild>
                <Lock size={12} />
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                side="bottom"
                className="w-64 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b bg-muted/30 p-2 px-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lock className="size-3 text-primary" />
                    Ordering Locked
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                    Manual reordering is disabled while a sort is active. Reset
                    the sort to move tasks freely.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>

        {sortConfig ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-xs font-normal text-primary hover:text-primary/80"
              onClick={() => handleSort(sortConfig.field)}
            >
              {activeSortOption ? (
                <activeSortOption.icon className="size-4" />
              ) : null}
              {activeSortOption?.label}
              {sortConfig.direction === "asc" ? (
                <ArrowUpDown className="size-4" />
              ) : (
                <ArrowDownUp className="size-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setSortConfig(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={sortedItems.length === 0}>
              <Button variant="ghost" className="text-xs">
                <ArrowUpDown className="size-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Sort by{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (asc/desc)
                </span>
              </DropdownMenuLabel>

              <DropdownMenuGroup>
                {SORT_OPTIONS.map(({ field, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={field}
                    onClick={() => handleSort(field)}
                    className="cursor-pointer"
                  >
                    <Icon className="opacity-70" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[100px] flex-1 flex-col gap-2 p-2 md:overflow-y-auto">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <BoardItem
                key={item.id}
                item={item}
                onDelete={onDelete}
                onEdit={onEdit}
                disabled={!isManualOrder}
              />
            ))
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                No tasks in this column.
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
