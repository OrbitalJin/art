import React, { useState, type FormEvent } from "react";
import { addDays, format } from "date-fns";
import type { Project, Task } from "@/lib/store/tasks/types";

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
  CalendarIcon,
  Zap,
  AlignLeft,
  Type,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  projects: Project[];
}

const urgencyConfig = {
  low: { color: "text-blue-500", bg: "bg-blue-500", label: "Low" },
  medium: { color: "text-amber-500", bg: "bg-amber-500", label: "Medium" },
  high: { color: "text-rose-500", bg: "bg-rose-500", label: "High" },
};

export const TaskDialog: React.FC<Props> = ({ onSubmit, projects }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [due, setDue] = useState<Date | null>(addDays(new Date(), 1));
  const [projectId, setProjectId] = useState<string>("inbox");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      urgency,
      energy,
      due: due?.toISOString(),
      status: "backlog",
      projectId: projectId === "inbox" ? undefined : projectId,
    });

    setTitle("");
    setDescription("");
    setUrgency("medium");
    setEnergy(3);
    setDue(addDays(new Date(), 1));
    setProjectId("inbox");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            New Task
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-muted-foreground" />
                      <span>Inbox</span>
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
                value={urgency}
                onValueChange={(v) =>
                  setUrgency(v as "low" | "medium" | "high")
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          urgencyConfig[urgency].bg,
                        )}
                      />
                      <span className={urgencyConfig[urgency].color}>
                        {urgencyConfig[urgency].label}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(urgencyConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("w-2 h-2 rounded-full", config.bg)}
                        />
                        <span className={config.color}>{config.label}</span>
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
                        !due && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
                        {due ? format(due, "PPP") : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={due ?? undefined}
                      onSelect={(date) => date && setDue(date)}
                      required={true}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setDue(null)}
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
                      onClick={() => setEnergy(level as 1 | 2 | 3 | 4 | 5)}
                      className={cn(
                        "p-0.5 transition-all duration-200",
                        "hover:scale-110 focus:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                        level <= energy
                          ? "text-amber-400"
                          : "text-muted-foreground/25",
                      )}
                    >
                      <Zap
                        className="w-4 h-4"
                        fill={level <= energy ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {energy} / 5
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="gap-2 min-w-[100px]"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
