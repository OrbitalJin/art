import { Type } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TaskTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskTitleField: React.FC<TaskTitleFieldProps> = ({
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Type className="h-3 w-3" />
      Title
    </label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What needs to be done?"
      className="h-11 text-base"
      autoFocus
    />
  </div>
);
