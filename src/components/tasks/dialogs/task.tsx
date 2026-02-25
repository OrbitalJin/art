import React, {
  useState,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react";
import { addDays, format, parseISO } from "date-fns";
import type { Project, Task } from "@/lib/store/tasks/types";
import { useTasksStore } from "@/lib/store/use-tasks-store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Folder,
  Inbox,
  Plus,
  Save,
  CalendarIcon,
  Zap,
  AlignLeft,
  Type,
  AlertCircle,
  X,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TaskFormData = {
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  energy: 1 | 2 | 3 | 4 | 5;
  due: Date | null;
  projectId: string;
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

const urgencyConfig = {
  low: {
    label: "Low",
    style: cn("text-green-600", "dark:text-green-400"),
  },

  medium: {
    label: "Medium",
    style: cn("text-amber-700", "dark:text-amber-400"),
  },

  high: {
    label: "High",
    style: cn("text-red-700", "dark:text-red-400"),
  },
};
const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  urgency: "medium",
  energy: 3,
  due: null,
  projectId: "inbox",
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

  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(() =>
    getInitialFormData(mode, isEdit ? props.task : undefined),
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
    <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          {isEdit ? "Edit Task" : "New Task"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="What needs to be done?"
              className="h-11 text-base"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlignLeft className="w-3 h-3" />
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Add details, notes, or subtasks..."
              className="min-h-[90px] resize-none text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Folder className="w-3 h-3" />
              Project
            </label>
            <Select
              value={formData.projectId}
              onValueChange={(v) => updateField("projectId", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-muted-foreground" />
                    <span>{inboxName}</span>
                  </div>
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <Folder className={cn("w-2 h-2", project.color)} />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              Urgency
            </label>
            <Select
              value={formData.urgency}
              onValueChange={(v) =>
                updateField("urgency", v as "low" | "medium" | "high")
              }
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {formData.urgency === "low" ? (
                      <Smile
                        className={urgencyConfig[formData.urgency].style}
                      />
                    ) : formData.urgency === "medium" ? (
                      <Meh className={urgencyConfig[formData.urgency].style} />
                    ) : (
                      <Frown
                        className={urgencyConfig[formData.urgency].style}
                      />
                    )}
                    <span className={urgencyConfig[formData.urgency].style}>
                      {urgencyConfig[formData.urgency].label}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(urgencyConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div
                      className={cn("flex items-center gap-2", config.style)}
                    >
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              Due Date
            </label>
            <div className="flex flex-row gap-1 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !formData.due && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {formData.due
                        ? format(formData.due, "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due ?? undefined}
                    onSelect={(date: Date | undefined) =>
                      updateField("due", date || null)
                    }
                    required={isCreate}
                  />
                </PopoverContent>
              </Popover>
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateField("due", null)}
                type="button"
              >
                <X />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Energy Required
            </label>
            <div
              className={cn(
                "flex items-center justify-between h-9 px-4 py-2",
                "rounded-md border border-input bg-background",
                "hover:bg-background hover:text-accent-foreground",
                "transition-colors",
              )}
            >
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      updateField("energy", level as 1 | 2 | 3 | 4 | 5)
                    }
                    className={cn(
                      "p-0.5 transition-all duration-200",
                      "hover:scale-110 focus:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                      level <= formData.energy
                        ? "text-amber-400"
                        : "text-muted-foreground/25",
                    )}
                  >
                    <Zap
                      className="w-4 h-4"
                      fill={level <= formData.energy ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {formData.energy} / 5
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.title.trim()}
            className="gap-2 min-w-[100px]"
          >
            {isEdit ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
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
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
};
