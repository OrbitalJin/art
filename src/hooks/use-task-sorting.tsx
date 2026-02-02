import { useState, useMemo } from "react";
import type { Task, Urgency } from "@/lib/store/tasks/types";

export type SortField = "title" | "urgency" | "due" | "energy";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const URGENCY_RANK: Record<Urgency, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const sortTasks = (
  items: Task[],
  field: SortField,
  direction: SortDirection,
): Task[] => {
  return [...items].sort((a, b) => {
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
        else comparison = new Date(a.due).getTime() - new Date(b.due).getTime();
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
};

export function useTaskSorting(items: Task[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => {
      if (!current || current.field !== field) {
        return { field, direction: "asc" };
      }
      return {
        field,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    return sortTasks(items, sortConfig.field, sortConfig.direction);
  }, [items, sortConfig]);

  return {
    sortedItems,
    sortConfig,
    setSortConfig,
    handleSort,
  };
}
