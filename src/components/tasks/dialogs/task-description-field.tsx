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
  <div className="w-full min-w-0 space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <AlignLeft className="h-3 w-3 shrink-0" />
      <span className="min-w-0">Description</span>
    </label>

    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add details, notes, or subtasks..."
      className="block w-full min-w-0 max-w-full resize-none overflow-x-hidden whitespace-pre-wrap break-words text-sm leading-relaxed"
    />
  </div>
);
