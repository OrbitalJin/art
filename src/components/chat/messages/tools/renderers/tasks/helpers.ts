export const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In progress",
  completed: "Completed",
};

export const statusLabelOf = (status: string | null): string | null =>
  status ? (STATUS_LABEL[status] ?? status) : null;

export const shortId = (id: string): string => id.slice(0, 8);

export interface TaskFieldsInput {
  title?: string;
  description?: string;
  status?: string;
  urgency?: string;
  energy?: number;
  due?: string;
}

export interface TaskTargetInput extends TaskFieldsInput {
  id: string;
}
