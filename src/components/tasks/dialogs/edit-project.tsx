import React, { useEffect, useState, type FormEvent } from "react";
import type { Project } from "@/lib/store/tasks/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Palette, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, updates: Partial<Project>) => void;
}

const PROJECT_COLORS = [
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

const getInitialColor = (project: Project | null) => {
  if (!project) return PROJECT_COLORS[0];
  return (
    PROJECT_COLORS.find((c) => c.text === project.color) || PROJECT_COLORS[0]
  );
};

export const EditProjectDialog: React.FC<Props> = ({
  project,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState(project?.name ?? "");
  const [selectedColor, setSelectedColor] = useState(getInitialColor(project));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    onSubmit(project.id, {
      name: name.trim(),
      color: selectedColor.text,
    });

    onOpenChange(false);
  };

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSelectedColor(getInitialColor(project));
    }
  }, [project]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={project.id}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            Edit Project
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all duration-200",
                    color.bg,
                    "hover:scale-110 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary",
                    selectedColor.name === color.name
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="gap-2 min-w-[100px]"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
