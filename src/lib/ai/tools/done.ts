import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const DONE_TOOL_NAME = "done";

export const doneTools = (): ToolSet => ({
  [DONE_TOOL_NAME]: tool({
    title: "Done",
    description:
      "Signal that the task is fully complete. Keep working until the task " +
      "is truly complete; never call this prematurely or instead of doing " +
      "the work. Provide a concise summary of what you did.",
    inputSchema: z.object({ summary: z.string() }),
  }),
});
