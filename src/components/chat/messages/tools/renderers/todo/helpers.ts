import type { ToolCallBlock } from "@/lib/store/session/types";
import { asArray, asRecord } from "../../helpers";

export interface ParsedTodo {
  content: string;
  status: string;
}

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
      status: typeof todo.status === "string" ? todo.status : "pending",
    }))
    .filter((todo) => todo.content);
