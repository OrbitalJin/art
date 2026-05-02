export type Urgency = "low" | "medium" | "high";
export type Energy = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = "backlog" | "inProgress" | "completed";
export type View = "calendar" | "board";

export interface Task {
  id: string;
  title: string;
  position: number;
  description?: string;
  urgency?: Urgency;
  energy?: Energy;
  due?: string;
  status: TaskStatus;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  dependencies?: string[];
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export const COLUMNS = ["backlog", "inProgress", "completed"] as const;
export type ColumnId = (typeof COLUMNS)[number];

export const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  completed: "Completed",
};
