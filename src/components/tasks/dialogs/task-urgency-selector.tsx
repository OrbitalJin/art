import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TaskField } from "./task-field";

type Urgency = "low" | "medium" | "high";

const isUrgency = (value: string): value is Urgency =>
  value === "low" || value === "medium" || value === "high";

interface UrgencyOptionProps {
  dotClassName: string;
  label: string;
}

const UrgencyOption = ({ dotClassName, label }: UrgencyOptionProps) => (
  <span className="flex items-center gap-2">
    <span className={cn("size-2 rounded-full", dotClassName)} />
    {label}
  </span>
);

interface TaskUrgencySelectorProps {
  value: Urgency;
  onChange: (value: Urgency) => void;
}

export const TaskUrgencySelector: React.FC<TaskUrgencySelectorProps> = ({
  value,
  onChange,
}) => {
  const handleValueChange = (next: string) => {
    if (isUrgency(next)) onChange(next);
  };

  return (
    <TaskField label="Urgency">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">
            <UrgencyOption dotClassName="bg-green-500" label="Low" />
          </SelectItem>
          <SelectItem value="medium">
            <UrgencyOption dotClassName="bg-amber-500" label="Medium" />
          </SelectItem>
          <SelectItem value="high">
            <UrgencyOption dotClassName="bg-red-500" label="High" />
          </SelectItem>
        </SelectContent>
      </Select>
    </TaskField>
  );
};
