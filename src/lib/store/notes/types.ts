export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastViewedAt: number;
  tags: string[];
}
