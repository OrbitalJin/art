export const WORKSPACES = ["work", "personal", "research"] as const;
export type Workspace = (typeof WORKSPACES)[number];

export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  lastViewedAt: number;
  workspace: Workspace;
  tags: string[];
}
