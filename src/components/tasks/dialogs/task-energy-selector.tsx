import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskField } from "./task-field";

type Energy = 1 | 2 | 3 | 4 | 5;

interface EnergyButtonProps {
  level: Energy;
  value: Energy;
  onSelect: (level: Energy) => void;
}

const EnergyButton = ({ level, value, onSelect }: EnergyButtonProps) => {
  const isActive = level <= value;

  return (
    <button
      type="button"
      aria-label={`Energy ${level} of 5`}
      onClick={() => onSelect(level)}
      className={cn(
        "rounded-sm p-0.5 transition-transform hover:scale-110",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "text-amber-400" : "text-muted-foreground/25",
      )}
    >
      <Zap className="size-4" fill={isActive ? "currentColor" : "none"} />
    </button>
  );
};

interface TaskEnergySelectorProps {
  value: Energy;
  onChange: (energy: Energy) => void;
}

export const TaskEnergySelector: React.FC<TaskEnergySelectorProps> = ({
  value,
  onChange,
}) => (
  <TaskField label="Energy Required">
    <div
      className={cn(
        "flex h-9 items-center justify-between rounded-md border border-input px-3",
        "bg-transparent shadow-xs dark:bg-input/30",
      )}
    >
      <div className="flex items-center gap-1">
        <EnergyButton level={1} value={value} onSelect={onChange} />
        <EnergyButton level={2} value={value} onSelect={onChange} />
        <EnergyButton level={3} value={value} onSelect={onChange} />
        <EnergyButton level={4} value={value} onSelect={onChange} />
        <EnergyButton level={5} value={value} onSelect={onChange} />
      </div>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {value} / 5
      </span>
    </div>
  </TaskField>
);
