import type { ToolRenderer } from "./types";
import { fileRenderers } from "./renderers/files";
import { searchRenderers } from "./renderers/search";
import { taskRenderers } from "./renderers/tasks";
import { journalRenderers } from "./renderers/journal";
import { askUserRenderers } from "./renderers/ask-user";
import { genericRenderer } from "./renderers/generic";

const TOOL_RENDERERS: Record<string, ToolRenderer> = {
  ...fileRenderers,
  ...searchRenderers,
  ...taskRenderers,
  ...journalRenderers,
  ...askUserRenderers,
};

export const resolveRenderer = (toolName: string): ToolRenderer =>
  TOOL_RENDERERS[toolName] ?? genericRenderer;
