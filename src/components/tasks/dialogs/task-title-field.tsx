import { Input } from "@/components/ui/input";
import { TaskField } from "./task-field";

interface TaskTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
}

export const TaskTitleField: React.FC<TaskTitleFieldProps> = ({
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}) => (
  <TaskField label="Title">
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What needs to be done?"
      aria-invalid={ariaInvalid}
      className="h-10"
      autoFocus
    />
  </TaskField>
);
