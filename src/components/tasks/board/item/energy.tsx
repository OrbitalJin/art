import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const EnergyBolt = ({ filled }: { filled: boolean }) => {
  const tone = filled
    ? "text-yellow-500/80 dark:text-yellow-400"
    : "text-muted-foreground/20";

  return (
    <Zap
      fill={filled ? "currentColor" : "none"}
      className={cn("size-3", tone)}
    />
  );
};

export const Energy = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    <EnergyBolt filled={level >= 1} />
    <EnergyBolt filled={level >= 2} />
    <EnergyBolt filled={level >= 3} />
    <EnergyBolt filled={level >= 4} />
    <EnergyBolt filled={level >= 5} />
  </div>
);
