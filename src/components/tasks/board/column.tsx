import type { Task, Urgency } from "@/lib/store/tasks/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
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

interface Props {
  id: string;
  title: string;
  items: Task[];
  overId: string | null;
  onDelete: (id: string) => void;
}

type SortField = "title" | "urgency" | "due" | "energy";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const URGENCY_RANK: Record<Urgency, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

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
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const isOverColumn =
    isOver || (overId !== null && items.some((item) => item.id === overId));

  const handleSort = (field: SortField) => {
    setSortConfig((current) => {
      if (!current || current.field !== field) {
        return { field, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { field, direction: "desc" };
      }
      return { field, direction: "asc" };
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      const { field, direction } = sortConfig;
      let comparison = 0;
      const multiplier = direction === "asc" ? 1 : -1;

      switch (field) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "urgency": {
          const rankA = a.urgency ? URGENCY_RANK[a.urgency] : 0;
          const rankB = b.urgency ? URGENCY_RANK[b.urgency] : 0;
          comparison = rankA - rankB;
          break;
        }
        case "due": {
          if (!a.due && !b.due) comparison = 0;
          else if (!a.due) comparison = 1;
          else if (!b.due) comparison = -1;
          else
            comparison = new Date(a.due).getTime() - new Date(b.due).getTime();
          break;
        }
        case "energy": {
          const energyA = a.energy || 0;
          const energyB = b.energy || 0;
          comparison = energyA - energyB;
          break;
        }
      }

      return comparison * multiplier;
    });
  }, [items, sortConfig]);

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
      <div className="p-2 px-3 border-b border-border flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <p className="">{title}</p>
          <div className="text-muted-foreground text-sm">({items.length})</div>
        </div>

        {sortConfig ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs font-normal text-primary hover:text-primary/80"
              onClick={() => handleSort(sortConfig.field)}
            >
              {activeSortOption && (
                <activeSortOption.icon className="h-3.5 w-3.5" />
              )}
              {activeSortOption?.label}
              {sortConfig.direction === "asc" ? (
                <ArrowUpDown className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownUp className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setSortConfig(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Sort by{" "}
                  <span className="text-xs text-muted-foreground">
                    (asc/desc)
                  </span>
                </DropdownMenuLabel>
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
        items={sortedItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 overflow-y-scroll md:overflow-y-hidden flex-1 flex flex-col gap-2 min-h-[100px]">
          {sortedItems.map((item) => (
            <BoardItem key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
