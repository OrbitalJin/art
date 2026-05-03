import { AlignLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskDescriptionField: React.FC<TaskDescriptionFieldProps> = ({
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <AlignLeft className="h-3 w-3" />
      Description
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add details, notes, or subtasks..."
      className="min-h-[90px] resize-none text-sm leading-relaxed"
    />
  </div>
);
