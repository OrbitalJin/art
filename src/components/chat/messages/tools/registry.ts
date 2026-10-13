import type { ToolRenderer } from "./types";
import { fileRenderers } from "./renderers/files";
import { searchRenderers } from "./renderers/search";
import { taskRenderers } from "./renderers/tasks";
import { askUserRenderers } from "./renderers/ask-user";
import { todoRenderers } from "./renderers/todo";
import { emailRenderers } from "./renderers/email";
import { youtubeRenderers } from "./renderers/youtube";
import { genericRenderer } from "./renderers/generic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

const TOOL_RENDERERS: Record<string, AnyRenderer> = {
  ...fileRenderers,
  ...searchRenderers,
  ...taskRenderers,
  ...askUserRenderers,
  ...todoRenderers,
  ...emailRenderers,
  ...youtubeRenderers,
};

export const resolveRenderer = (toolName: string): AnyRenderer =>
  TOOL_RENDERERS[toolName] ?? genericRenderer;
