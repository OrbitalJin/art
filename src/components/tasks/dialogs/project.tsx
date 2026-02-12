import React, {
  useState,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Project } from "@/lib/store/tasks/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Type, FolderPlus, Palette, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectColor = {
  name: string;
  bg: string;
  text: string;
};

type ProjectFormData = {
  name: string;
  selectedColor: ProjectColor;
};

interface CreateModeProps {
  mode: "create";
  onSubmit: (name: string, color: string) => void;
  project?: never;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

interface EditModeProps {
  mode: "edit";
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, updates: Partial<Project>) => void;
  trigger?: never;
}

type ProjectFormDialogProps = CreateModeProps | EditModeProps;

const PROJECT_COLORS: ProjectColor[] = [
  // Grays
  { name: "slate", bg: "bg-slate-500", text: "text-slate-500" },
  { name: "zinc", bg: "bg-zinc-500", text: "text-zinc-500" },

  // Warm spectrum
  { name: "red", bg: "bg-red-500", text: "text-red-500" },
  { name: "orange", bg: "bg-orange-500", text: "text-orange-500" },
  { name: "amber", bg: "bg-amber-500", text: "text-amber-500" },
  { name: "yellow", bg: "bg-yellow-500", text: "text-yellow-500" },
  { name: "lime", bg: "bg-lime-500", text: "text-lime-500" },

  // Greens & Teals
  { name: "green", bg: "bg-green-500", text: "text-green-500" },
  { name: "emerald", bg: "bg-emerald-500", text: "text-emerald-500" },
  { name: "teal", bg: "bg-teal-500", text: "text-teal-500" },
  { name: "cyan", bg: "bg-cyan-500", text: "text-cyan-500" },

  // Blues & Purples
  { name: "sky", bg: "bg-sky-500", text: "text-sky-500" },
  { name: "blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "indigo", bg: "bg-indigo-500", text: "text-indigo-500" },
  { name: "violet", bg: "bg-violet-500", text: "text-violet-500" },
  { name: "purple", bg: "bg-purple-500", text: "text-purple-500" },
  { name: "fuchsia", bg: "bg-fuchsia-500", text: "text-fuchsia-500" },
  { name: "pink", bg: "bg-pink-500", text: "text-pink-500" },
  { name: "rose", bg: "bg-rose-500", text: "text-rose-500" },
];

const defaultFormData: ProjectFormData = {
  name: "",
  selectedColor: PROJECT_COLORS[0],
};

const getInitialFormData = (
  mode: "create" | "edit",
  project?: Project | null,
): ProjectFormData => {
  if (mode === "edit" && project) {
    const projectColor =
      PROJECT_COLORS.find((c) => c.text === project.color) || PROJECT_COLORS[0];
    return {
      name: project.name,
      selectedColor: projectColor,
    };
  }
  return defaultFormData;
};

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = (props) => {
  const { mode, trigger } = props;
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(() =>
    getInitialFormData(mode, isEdit ? props.project : undefined),
  );

  const isControlled = props.open !== undefined;
  const open = isControlled ? props.open : internalOpen;
  const onOpenChange = isControlled ? props.onOpenChange! : setInternalOpen;

  useEffect(() => {
    if (isEdit && props.project && open) {
      setFormData(getInitialFormData("edit", props.project));
    }
  }, [isEdit, props.project, open]);

  const updateField = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEdit) {
      if (props.project) {
        props.onSubmit(props.project.id, {
          name: formData.name.trim(),
          color: formData.selectedColor.text,
        });
      }
    } else {
      props.onSubmit(formData.name.trim(), formData.selectedColor.text);
      setFormData(defaultFormData);
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    if (isCreate) {
      setFormData(defaultFormData);
    }
    onOpenChange(false);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          {isEdit ? "Edit Project" : "New Project"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Type className="w-3 h-3" />
            Project Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Market Research, UI Design..."
            className="h-11 text-base"
            autoFocus
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Palette className="w-3 h-3" />
            Project Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => updateField("selectedColor", color)}
                className={cn(
                  "w-6 h-6 rounded-full transition-all duration-200",
                  color.bg,
                  "hover:scale-110 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary",
                  formData.selectedColor.name === color.name
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "opacity-60 hover:opacity-100",
                )}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.name.trim()}
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
                Create
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
          <Button size="icon" variant="outline">
            <FolderPlus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
};
