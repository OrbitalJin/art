import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

import { TaskTitleField } from "./task-title-field";
import { TaskDescriptionField } from "./task-description-field";
import { TaskProjectSelector } from "./task-project-selector";
import { TaskUrgencySelector } from "./task-urgency-selector";
import { TaskDueDatePicker } from "./task-due-date-picker";
import { TaskEnergySelector } from "./task-energy-selector";
import { TaskDependenciesPopover } from "./task-dependencies-popover";
import { taskFormSchema, type TaskFormValues } from "./task-form-values";

interface TaskFormProps {
  initialValues: TaskFormValues;
  submitLabel: string;
  requireDue?: boolean;
  currentTaskId?: string;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  submitLabel,
  requireDue,
  currentTaskId,
  onSubmit,
  onCancel,
}) => {
  const projects = useTasksStore((state) => state.projects);
  const inboxName = useTasksStore((state) => state.inboxName);
  const tasks = useTasksStore((state) => state.tasks);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = form.handleSubmit(onSubmit);
  const isTitleEmpty = !form.watch("title").trim();

  const toggleDependency = (taskId: string) => {
    const current = form.getValues("dependencies");
    form.setValue(
      "dependencies",
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  return (
    <form
      id="task-form"
      onSubmit={handleSubmit}
      className="min-w-0 space-y-6 p-6"
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="grid min-w-0 grid-cols-2 gap-4">
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
                  required={requireDue}
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
                  currentTaskId={currentTaskId}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="task-form" disabled={isTitleEmpty}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
