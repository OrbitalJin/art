import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { DONE_TOOL_NAME } from "./names";

export const doneTools = (): ToolSet => ({
  [DONE_TOOL_NAME]: tool({
    title: "Done",
    description:
      "Signal that the task is fully complete. Provide a concise summary of what you did.",
    inputSchema: z.object({ summary: z.string() }),
  }),
});
