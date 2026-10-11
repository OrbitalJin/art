import type { ToolRenderer } from "./types";
import { fileRenderers } from "./renderers/files";
import { searchRenderers } from "./renderers/search";
import { taskRenderers } from "./renderers/tasks";
import { askUserRenderers } from "./renderers/ask-user";
import { todoRenderers } from "./renderers/todo";
import { gmailRenderers } from "./renderers/gmail";
import { slackRenderers } from "./renderers/slack";
import { googlesheetsRenderers } from "./renderers/googlesheets";
import { genericRenderer } from "./renderers/generic";

const TOOL_RENDERERS: Record<string, ToolRenderer> = {
  ...fileRenderers,
  ...searchRenderers,
  ...taskRenderers,
  ...askUserRenderers,
  ...todoRenderers,
  ...gmailRenderers,
  ...slackRenderers,
  ...googlesheetsRenderers,
};

export const resolveRenderer = (toolName: string): ToolRenderer =>
  TOOL_RENDERERS[toolName] ?? genericRenderer;
