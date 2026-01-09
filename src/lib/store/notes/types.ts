export type Workspace = "work" | "personal" | "research";
export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastViewedAt: number;
  workspace: Workspace;
  tags: string[];
}
