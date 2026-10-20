import { addDays, parseISO } from "date-fns";
import * as z from "zod";
import type { Task } from "@/lib/store/tasks/types";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title is too long."),
  description: z.string().max(2000, "Description is too long.").optional(),
  urgency: z.enum(["low", "medium", "high"]),
  energy: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  due: z.date().nullable(),
  projectId: z.string(),
  dependencies: z.array(z.string()),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const createTaskDefaults = (
  activeProjectId: string,
  defaultDue?: Date | null,
): TaskFormValues => ({
  title: "",
  description: "",
  urgency: "medium",
  energy: 3,
  due: defaultDue ?? addDays(new Date(), 1),
  projectId: activeProjectId ?? "inbox",
  dependencies: [],
});

export const taskToFormValues = (task: Task): TaskFormValues => ({
  title: task.title,
  description: task.description ?? "",
  urgency: task.urgency ?? "medium",
  energy: task.energy ?? 3,
  due: task.due ? parseISO(task.due) : null,
  projectId: task.projectId ?? "inbox",
  dependencies: task.dependencies ?? [],
});

const formValuesToTaskFields = (values: TaskFormValues): Partial<Task> => ({
  title: values.title.trim(),
  description: values.description?.trim() || undefined,
  urgency: values.urgency,
  energy: values.energy,
  due: values.due?.toISOString(),
  projectId: values.projectId === "inbox" ? undefined : values.projectId,
  dependencies:
    values.dependencies.length > 0 ? values.dependencies : undefined,
});

export const formValuesToCreatePayload = (
  values: TaskFormValues,
): Omit<Task, "id" | "createdAt" | "updatedAt" | "position"> => ({
  ...formValuesToTaskFields(values),
  title: values.title.trim(),
  status: "backlog",
});

export const formValuesToTaskUpdates = (values: TaskFormValues): Partial<Task> =>
  formValuesToTaskFields(values);
