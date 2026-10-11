import type { ToolCallBlock } from "@/lib/store/session/types";
import { asArray, asRecord } from "../../helpers";

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface ParsedTodo {
  content: string;
  status: TodoStatus;
}

const isTodoStatus = (value: unknown): value is TodoStatus =>
  value === "pending" || value === "in_progress" || value === "completed";

export const inputRecord = (block: ToolCallBlock) => asRecord(block.input);

export const parseTodos = (block: ToolCallBlock): ParsedTodo[] =>
  asArray(inputRecord(block)?.todos)
    .map((todo) => asRecord(todo))
    .filter((todo): todo is Record<string, unknown> => todo !== null)
    .map((todo) => ({
      content:
        typeof todo.content === "string" && todo.content.trim()
          ? todo.content
          : "",
      status: isTodoStatus(todo.status) ? todo.status : "pending",
    }))
    .filter((todo) => todo.content);
