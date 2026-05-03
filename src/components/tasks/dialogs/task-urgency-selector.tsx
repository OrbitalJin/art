import { AlertCircle, Smile, Meh, Frown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Urgency = "low" | "medium" | "high";

const urgencyConfig: Record<
  Urgency,
  { label: string; style: string; icon: typeof Smile }
> = {
  low: { label: "Low", style: cn("text-green-600", "dark:text-green-400"), icon: Smile },
  medium: { label: "Medium", style: cn("text-amber-700", "dark:text-amber-400"), icon: Meh },
  high: { label: "High", style: cn("text-red-700", "dark:text-red-400"), icon: Frown },
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
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        Urgency
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as Urgency)}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className={config.style} />
              <span className={config.style}>{config.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(urgencyConfig).map(([key, cfg]) => {
            const ItemIcon = cfg.icon;
            return (
              <SelectItem key={key} value={key}>
                <div className={cn("flex items-center gap-2", cfg.style)}>
                  <ItemIcon className="h-4 w-4" />
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
