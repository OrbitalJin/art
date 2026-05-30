import type { Session } from "../store/session/types";
import { tool, type ToolSet } from "ai";
import { journalTools } from "./journal";
import { z } from "zod";

export interface Opts {
  session?: Session;
}

export const customTools = (): ToolSet => {
  const tools: ToolSet = {
    date: tool({
      title: "Get Current Date",
      description: "Get the current date",
      inputSchema: z.object({}),
      outputSchema: z.string(),
      execute: async () => {
        const now = new Date();
        return now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    }),
    time: tool({
      title: "Get Current Time",
      description: "Get the current time",
      inputSchema: z.object({}),
      outputSchema: z.string(),
      execute: async () => {
        const now = new Date();
        return now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
      },
    }),
  };
  return { ...tools, ...journalTools() };
};
