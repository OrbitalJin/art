import type { PageMeta, Workspace } from "./types";

/** The single source of truth for a new page's metadata defaults. */
export const createPageMeta = (
  workspace: Workspace,
  title = "Untitled Page",
): PageMeta => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title,
    tags: [],
    workspace,
    wordCount: 0,
    createdAt: now,
    updatedAt: now,
    lastViewedAt: now,
  };
};
