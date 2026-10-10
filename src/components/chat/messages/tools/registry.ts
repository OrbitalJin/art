import type { ToolRenderer } from "./types";
import { fileRenderers } from "./renderers/files";
import { searchRenderers } from "./renderers/search";
import { taskRenderers } from "./renderers/tasks";
import { askUserRenderers } from "./renderers/ask-user";
import { todoRenderers } from "./renderers/todo";
import { gmailRenderers } from "./renderers/gmail";
import { genericRenderer } from "./renderers/generic";

const TOOL_RENDERERS: Record<string, ToolRenderer> = {
  ...fileRenderers,
  ...searchRenderers,
  ...taskRenderers,
  ...askUserRenderers,
  ...todoRenderers,
  ...gmailRenderers,
};

export const resolveRenderer = (toolName: string): ToolRenderer =>
  TOOL_RENDERERS[toolName] ?? genericRenderer;
