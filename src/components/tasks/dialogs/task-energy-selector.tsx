import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Energy = 1 | 2 | 3 | 4 | 5;

interface TaskEnergySelectorProps {
  value: Energy;
  onChange: (energy: Energy) => void;
}

export const TaskEnergySelector: React.FC<TaskEnergySelectorProps> = ({
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Zap className="h-3 w-3" />
      Energy Required
    </label>
    <div
      className={cn(
        "flex h-9 items-center justify-between rounded-md border border-input bg-background px-4 py-2",
        "transition-colors hover:bg-background hover:text-accent-foreground",
      )}
    >
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level as Energy)}
            className={cn(
              "rounded-sm p-0.5 transition-all duration-200 hover:scale-110",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              level <= value ? "text-amber-400" : "text-muted-foreground/25",
            )}
          >
            <Zap
              className="h-4 w-4"
              fill={level <= value ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      <span className="tabular-nums text-xs font-medium text-muted-foreground">
        {value} / 5
      </span>
    </div>
  </div>
);
