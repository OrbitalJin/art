export const WORKSPACES = ["work", "personal", "research"] as const;
export type Workspace = (typeof WORKSPACES)[number];

export interface Page {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspace: Workspace;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  lastViewedAt: number;
}

/**
 * A page's metadata, the only part kept in the journal index. The body lives
 * in its own markdown file (`$APPDATA/journal/<id>.md`); `wordCount` is a
 * derived number stored here so the sidebar never has to read bodies.
 */
export interface PageMeta {
  id: string;
  title: string;
  tags: string[];
  workspace: Workspace;
  archived?: boolean;
  pinned?: boolean;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
  lastViewedAt: number;
}
