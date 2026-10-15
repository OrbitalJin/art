import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Urgency = "low" | "medium" | "high";

const urgencyConfig: Record<Urgency, { label: string; style: string }> = {
  low: {
    label: "Low",
    style: cn("text-green-600/70", "dark:text-green-400/70"),
  },
  medium: {
    label: "Medium",
    style: cn("text-amber-700/70", "dark:text-amber-400/70"),
  },
  high: {
    label: "High",
    style: cn("text-red-700", "dark:text-red-400"),
  },
};

interface TaskUrgencySelectorProps {
  value: Urgency;
  onChange: (value: Urgency) => void;
}

export const TaskUrgencySelector: React.FC<TaskUrgencySelectorProps> = ({
  value,
  onChange,
}) => {
  const config = urgencyConfig[value];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Urgency
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as Urgency)}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className={config.style}>{config.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(urgencyConfig).map(([key, cfg]) => {
            return (
              <SelectItem key={key} value={key}>
                <div className={cn("flex items-center gap-2", cfg.style)}>
                  <span>{cfg.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
