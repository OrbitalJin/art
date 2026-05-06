import React, {
  useState,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react";
import { addDays, parseISO } from "date-fns";
import type { Project, Task } from "@/lib/store/tasks/types";
import { useTasksStore } from "@/lib/store/use-tasks-store";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

import { TaskFormHeader } from "./task-form-header";
import { TaskTitleField } from "./task-title-field";
import { TaskDescriptionField } from "./task-description-field";
import { TaskProjectSelector } from "./task-project-selector";
import { TaskUrgencySelector } from "./task-urgency-selector";
import { TaskDueDatePicker } from "./task-due-date-picker";
import { TaskEnergySelector } from "./task-energy-selector";
import { TaskDependenciesPopover } from "./task-dependencies-popover";

type TaskFormData = {
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  energy: 1 | 2 | 3 | 4 | 5;
  due: Date | null;
  projectId: string;
  dependencies: string[];
};

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

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  urgency: "medium",
  energy: 3,
  due: null,
  projectId: "inbox",
  dependencies: [],
};

const getInitialFormData = (
  mode: "create" | "edit",
  task?: Task | null,
  activeProjectId?: string | "inbox",
): TaskFormData => {
  if (mode === "edit" && task) {
    return {
      title: task.title,
      description: task.description || "",
      urgency: task.urgency || "medium",
      energy: task.energy || 3,
      due: task.due ? parseISO(task.due) : null,
      projectId: task.projectId || "inbox",
      dependencies: task.dependencies || [],
    };
  }

  return {
    ...defaultFormData,
    projectId: activeProjectId ?? "inbox",
    due: addDays(new Date(), 1),
  };
};

export const TaskFormDialog: React.FC<TaskFormDialogProps> = (props) => {
  const { mode, projects, trigger } = props;
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const inboxName = useTasksStore((state) => state.inboxName);
  const tasks = useTasksStore((state) => state.tasks);

  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(() =>
    getInitialFormData(mode, isEdit ? props.task : undefined, activeProjectId),
  );

  const isControlled = props.open !== undefined;
  const open = isControlled ? props.open : internalOpen;
  const onOpenChange = isControlled ? props.onOpenChange! : setInternalOpen;

  useEffect(() => {
    if (isEdit && props.task && open) {
      setFormData(getInitialFormData("edit", props.task));
    } else if (isCreate && open) {
      setFormData((prev) => ({ ...prev, projectId: activeProjectId }));
    }
  }, [isEdit, isCreate, props.task, open, activeProjectId]);

  const updateField = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDependency = (taskId: string) => {
    if (formData.dependencies.includes(taskId)) {
      updateField(
        "dependencies",
        formData.dependencies.filter((id) => id !== taskId),
      );
    } else {
      updateField("dependencies", [...formData.dependencies, taskId]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      urgency: formData.urgency,
      energy: formData.energy,
      due: formData.due?.toISOString(),
      projectId:
        formData.projectId === "inbox" ? undefined : formData.projectId,
      dependencies:
        formData.dependencies.length > 0 ? formData.dependencies : undefined,
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

      setFormData({
        ...defaultFormData,
        projectId: activeProjectId,
        due: addDays(new Date(), 1),
      });
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    if (isCreate) {
      setFormData({
        ...defaultFormData,
        projectId: activeProjectId,
        due: addDays(new Date(), 1),
      });
    }

    onOpenChange(false);
  };

  const dialogContent = (
    <DialogContent className="gap-0 overflow-x-hidden p-0 sm:max-w-[520px]">
      <TaskFormHeader mode={mode} />

      <form onSubmit={handleSubmit} className="min-w-0 space-y-5 p-6">
        <div className="min-w-0 space-y-4">
          <TaskTitleField
            value={formData.title}
            onChange={(v) => updateField("title", v)}
          />

          <TaskDescriptionField
            value={formData.description}
            onChange={(v) => updateField("description", v)}
          />
        </div>

        <div className="min-w-0 grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <TaskProjectSelector
              value={formData.projectId}
              onChange={(v) => updateField("projectId", v)}
              projects={projects}
              inboxName={inboxName}
            />
          </div>

          <div className="min-w-0">
            <TaskUrgencySelector
              value={formData.urgency}
              onChange={(v) => updateField("urgency", v)}
            />
          </div>

          <div className="min-w-0">
            <TaskDueDatePicker
              value={formData.due}
              onChange={(v) => updateField("due", v)}
              required={isCreate}
            />
          </div>

          <div className="min-w-0">
            <TaskEnergySelector
              value={formData.energy}
              onChange={(v) => updateField("energy", v)}
            />
          </div>

          <div className="col-span-2 min-w-0">
            <TaskDependenciesPopover
              selectedIds={formData.dependencies}
              onToggle={toggleDependency}
              onClear={() => updateField("dependencies", [])}
              tasks={tasks}
              projects={projects}
              inboxName={inboxName}
              currentTaskId={isEdit ? props.task?.id : undefined}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!formData.title.trim()}
            className="min-w-[100px] gap-2"
          >
            {isEdit ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Task
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isCreate && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      {isCreate && !trigger && (
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
