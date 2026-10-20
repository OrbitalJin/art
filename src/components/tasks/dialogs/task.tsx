import { Plus } from "lucide-react";
import type { Task } from "@/lib/store/tasks/types";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { TaskFormHeader } from "./task-form-header";
import { TaskForm } from "./task-form";
import {
  createTaskDefaults,
  formValuesToCreatePayload,
  formValuesToTaskUpdates,
  taskToFormValues,
} from "./task-form-values";

const dialogContentClassName = "gap-0 overflow-x-hidden p-0 sm:max-w-[520px]";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "position">,
  ) => void;
  defaultDue?: Date | null;
}

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  onCreate,
  defaultDue,
}: CreateTaskDialogProps) => {
  const activeProjectId = useTasksStore((state) => state.activeProjectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="size-9"
          aria-label="New task"
        >
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogContentClassName}>
        <TaskFormHeader mode="create" />
        <TaskForm
          key={defaultDue?.toISOString() ?? "new"}
          initialValues={createTaskDefaults(activeProjectId, defaultDue)}
          submitLabel="Create Task"
          requireDue
          onSubmit={(values) => {
            onCreate(formValuesToCreatePayload(values));
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  onUpdate,
}: EditTaskDialogProps) => (
  <Dialog open={open && task !== null} onOpenChange={onOpenChange}>
    <DialogContent className={dialogContentClassName}>
      <TaskFormHeader mode="edit" />
      {task && (
        <TaskForm
          key={task.id}
          initialValues={taskToFormValues(task)}
          submitLabel="Save Changes"
          currentTaskId={task.id}
          onSubmit={(values) => {
            onUpdate(task.id, formValuesToTaskUpdates(values));
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
);
