import React, { useEffect, type ReactNode } from "react";
import { addDays, parseISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import type { Project, Task } from "@/lib/store/tasks/types";
import { useTasksStore } from "@/lib/store/use-tasks-store";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Plus } from "lucide-react";

import { TaskFormHeader } from "./task-form-header";
import { TaskTitleField } from "./task-title-field";
import { TaskDescriptionField } from "./task-description-field";
import { TaskProjectSelector } from "./task-project-selector";
import { TaskUrgencySelector } from "./task-urgency-selector";
import { TaskDueDatePicker } from "./task-due-date-picker";
import { TaskEnergySelector } from "./task-energy-selector";
import { TaskDependenciesPopover } from "./task-dependencies-popover";

const taskFormSchema = z.object({
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

type TaskFormValues = z.infer<typeof taskFormSchema>;

const defaultValues = (
  activeProjectId: string,
  isCreate: boolean,
): TaskFormValues => ({
  title: "",
  description: "",
  urgency: "medium",
  energy: 3,
  due: isCreate ? addDays(new Date(), 1) : null,
  projectId: activeProjectId ?? "inbox",
  dependencies: [],
});

const taskToFormValues = (task: Task): TaskFormValues => ({
  title: task.title,
  description: task.description ?? "",
  urgency: task.urgency ?? "medium",
  energy: task.energy ?? 3,
  due: task.due ? parseISO(task.due) : null,
  projectId: task.projectId ?? "inbox",
  dependencies: task.dependencies ?? [],
});

interface BaseProps {
  projects: Project[];
}

interface CreateModeProps extends BaseProps {
  mode: "create";
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  task?: never;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, updates: Partial<Task>) => void;
  trigger?: never;
}

type TaskFormDialogProps = CreateModeProps | EditModeProps;

export const TaskFormDialog: React.FC<TaskFormDialogProps> = (props) => {
  const { mode, projects } = props;
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const inboxName = useTasksStore((state) => state.inboxName);
  const tasks = useTasksStore((state) => state.tasks);

  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = props.open !== undefined;
  const open = isControlled ? props.open! : internalOpen;
  const onOpenChange = isControlled ? props.onOpenChange! : setInternalOpen;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues:
      isEdit && props.task
        ? taskToFormValues(props.task)
        : defaultValues(activeProjectId, true),
  });

  useEffect(() => {
    if (!open) return;

    if (isEdit && props.task) {
      form.reset(taskToFormValues(props.task));
    } else if (isCreate) {
      form.reset(defaultValues(activeProjectId, true));
    }
  }, [open, isEdit, isCreate, props.task, activeProjectId, form]);

  const handleSubmit = form.handleSubmit((values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      urgency: values.urgency,
      energy: values.energy,
      due: values.due?.toISOString(),
      projectId: values.projectId === "inbox" ? undefined : values.projectId,
      dependencies:
        values.dependencies.length > 0 ? values.dependencies : undefined,
    };

    if (isEdit) {
      if (props.task) {
        props.onSubmit(props.task.id, payload);
      }
    } else {
      props.onSubmit({
        ...payload,
        status: "backlog",
      } as Omit<Task, "id" | "createdAt" | "updatedAt">);
    }

    onOpenChange(false);
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const toggleDependency = (taskId: string) => {
    const current = form.getValues("dependencies");
    form.setValue(
      "dependencies",
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const dialogContent = (
    <DialogContent className="gap-0 overflow-x-hidden p-0 sm:max-w-[520px]">
      <TaskFormHeader mode={mode} />

      <form
        id="task-form"
        onSubmit={handleSubmit}
        className="min-w-0 space-y-5 p-6"
      >
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <TaskTitleField
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <TaskDescriptionField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="min-w-0 grid grid-cols-2 gap-4">
          {/* Project */}
          <div className="min-w-0">
            <Controller
              name="projectId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <TaskProjectSelector
                    value={field.value}
                    onChange={field.onChange}
                    projects={projects}
                    inboxName={inboxName}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Urgency */}
          <div className="min-w-0">
            <Controller
              name="urgency"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <TaskUrgencySelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Due date */}
          <div className="min-w-0">
            <Controller
              name="due"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <TaskDueDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    required={isCreate}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Energy */}
          <div className="min-w-0">
            <Controller
              name="energy"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <TaskEnergySelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Dependencies */}
          <div className="col-span-2 min-w-0">
            <Controller
              name="dependencies"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <TaskDependenciesPopover
                    selectedIds={field.value}
                    onToggle={toggleDependency}
                    onClear={() => form.setValue("dependencies", [])}
                    tasks={tasks}
                    projects={projects}
                    inboxName={inboxName}
                    currentTaskId={isEdit ? props.task?.id : undefined}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            disabled={!form.watch("title").trim()}
          >
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isCreate && props.trigger && (
        <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      )}

      {isCreate && !props.trigger && (
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}

      {dialogContent}
    </Dialog>
  );
};
