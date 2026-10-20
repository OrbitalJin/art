import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/lib/store/tasks/types";
import { TaskField } from "./task-field";

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
  <TaskField label="Project">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inbox">{inboxName}</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </TaskField>
);
