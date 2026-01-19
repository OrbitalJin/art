export const WORKSPACES = ["work", "personal", "research"] as const;
export type Workspace = (typeof WORKSPACES)[number];

export interface Entry {
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
