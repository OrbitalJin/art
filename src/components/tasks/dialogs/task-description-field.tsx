import { Textarea } from "@/components/ui/textarea";
import { TaskField } from "./task-field";

interface TaskDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
}

export const TaskDescriptionField: React.FC<TaskDescriptionFieldProps> = ({
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}) => (
  <TaskField label="Description">
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add details, notes, or subtasks..."
      aria-invalid={ariaInvalid}
      className="min-h-24 w-full min-w-0 resize-none break-words text-sm leading-relaxed"
    />
  </TaskField>
);
