import { Folder, Inbox } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/store/tasks/types";

interface TaskProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  projects: Project[];
  inboxName: string;
}

export const TaskProjectSelector: React.FC<TaskProjectSelectorProps> = ({
  value,
  onChange,
  projects,
  inboxName,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Folder className="h-3 w-3" />
      Project
    </label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inbox">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <span>{inboxName}</span>
          </div>
        </SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center gap-2">
              <Folder className={cn("h-2 w-2", project.color)} />
              <span>{project.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
