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

const SORT_LABELS = {
  title: { label: "Title", icon: Type },
  urgency: { label: "Urgency", icon: TriangleAlert },
  due: { label: "Due Date", icon: Calendar },
  energy: { label: "Energy", icon: Zap },
};

const OrderingLockedHint = () => (
  <HoverCard openDelay={200} closeDelay={150}>
    <HoverCardTrigger asChild>
      <Lock size={12} className="shrink-0 text-muted-foreground" />
    </HoverCardTrigger>
    <HoverCardContent
      align="start"
      side="bottom"
      className="w-60 rounded-xl border-none p-3 shadow-xl ring-1 ring-border"
    >
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Lock className="size-3 text-primary" />
        Ordering locked
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Manual reordering is disabled while a sort is active. Reset the sort to
        move tasks freely.
      </p>
    </HoverCardContent>
  </HoverCard>
);

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

  const activeSortField = sortConfig?.field;
  const activeSort = activeSortField ? SORT_LABELS[activeSortField] : null;
  const ActiveSortIcon = activeSort?.icon;

  const sortDirectionIcon =
    sortConfig?.direction === "asc" ? (
      <ArrowUpDown className="size-3.5" />
    ) : (
      <ArrowDownUp className="size-3.5" />
    );

  const sortControls = sortConfig ? (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 rounded-full px-2.5 text-xs font-normal text-primary hover:text-primary/80"
        onClick={() => handleSort(sortConfig.field)}
      >
        {ActiveSortIcon ? <ActiveSortIcon className="size-3.5" /> : null}
        {activeSort?.label}
        {sortDirectionIcon}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 rounded-full text-muted-foreground"
        onClick={() => setSortConfig(null)}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={sortedItems.length === 0}>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 rounded-full px-2.5 text-xs font-normal text-muted-foreground"
        >
          <ArrowUpDown className="size-3.5" />
          Sort
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuLabel>
          Sort by{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (asc/desc)
          </span>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSort("title")}
            className="cursor-pointer"
          >
            <Type className="opacity-70" />
            Title
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort("urgency")}
            className="cursor-pointer"
          >
            <TriangleAlert className="opacity-70" />
            Urgency
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort("due")}
            className="cursor-pointer"
          >
            <Calendar className="opacity-70" />
            Due Date
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort("energy")}
            className="cursor-pointer"
          >
            <Zap className="opacity-70" />
            Energy
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col rounded-lg bg-card/50 transition-colors border border-border/50",
        isOverColumn && "bg-primary/10 ring-1 ring-primary/30",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <p className="truncate text-sm font-semibold">{title}</p>
          <span className="shrink-0 rounded-full bg-background/70 px-1.5 text-xs text-muted-foreground">
            {items.length}
          </span>
          {!isManualOrder && <OrderingLockedHint />}
        </div>
        {sortControls}
      </div>

      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[100px] flex-1 overflow-y-auto px-2 py-1 scroll-fade-y">
          {sortedItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sortedItems.map((item) => (
                <BoardItem
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  disabled={!isManualOrder}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center py-10">
              <p className="text-sm text-muted-foreground/70">No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
