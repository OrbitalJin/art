export type TodoStatus = "pending" | "in_progress" | "completed";

export interface ParsedTodo {
  content: string;
  status: TodoStatus;
}
