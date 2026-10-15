import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      Project
    </label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inbox">
          <div className="flex items-center gap-2">
            <span>{inboxName}</span>
          </div>
        </SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center gap-2">
              <span>{project.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
