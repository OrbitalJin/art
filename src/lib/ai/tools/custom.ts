import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";

export interface Opts {
  session?: Session;
}

export const customTools = (): ToolSet => {
  const tools: ToolSet = {};
  return { ...tools, ...journalTools(), ...tasksTools() };
};
