import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { BoardItem } from "./item";
import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  ArrowUpDown,
  Calendar,
  TriangleAlert,
  Type,
  X,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/store/tasks/types";
import { useTaskSorting } from "@/hooks/use-task-sorting";

interface Props {
  id: string;
  title: string;
  items: Task[];
  overId: string | null;
  onDelete: (id: string) => void;
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
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { sortedItems, sortConfig, setSortConfig, handleSort } =
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
        "flex-1 flex flex-col border border-border rounded-md bg-background transition-colors",
        isOverColumn && "ring-2 ring-primary bg-primary/5",
      )}
    >
      {/* Column Header */}
      <div className="py-2 px-3 border-b border-border flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <p className="font-medium">{title}</p>
          <span className="text-muted-foreground text-sm">
            ({items.length})
          </span>
        </div>

        {sortConfig ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-xs text-primary font-normal hover:text-primary/80"
              onClick={() => handleSort(sortConfig.field)}
            >
              {activeSortOption && <activeSortOption.icon />}
              {activeSortOption?.label}
              {sortConfig.direction === "asc" ? (
                <ArrowUpDown />
              ) : (
                <ArrowDownUp />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setSortConfig(null)}
            >
              <X />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xs">
                <ArrowUpDown />
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

      {/* Drop Zone / List */}
      <SortableContext
        items={sortedItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 overflow-y-auto flex-1 flex flex-col gap-2 min-h-[100px]">
          {sortedItems.map((item) => (
            <BoardItem key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
