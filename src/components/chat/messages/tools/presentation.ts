import type { ToolCallBlock } from "@/lib/store/session/types";
import type { ToolRendererEntry } from "./types";

/** Trace status for a block: running while executing, error once failed. */
export const toolStatus = (
  state: ToolCallBlock["state"],
): "running" | "error" | undefined => {
  if (state === "executing") return "running";
  if (state === "error") return "error";
  return undefined;
};

/** The headline for a card/row: the executing title while running, else title. */
export const surfaceTitle = (
  block: ToolCallBlock,
  entry: ToolRendererEntry,
): string =>
  block.state === "executing" && entry.executingTitle
    ? `${entry.executingTitle}…`
    : entry.title;
