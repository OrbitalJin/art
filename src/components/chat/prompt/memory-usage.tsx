import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemoryUsageProps {
  usage: string; // e.g. "42.3%"
}

export const MemoryUsage = ({ usage }: MemoryUsageProps) => {
  const percentage = Number.parseFloat(usage) || 0;

  // Clean color transition based on usage
  const colorClass =
    percentage < 50
      ? "text-emerald-500"
      : percentage < 80
        ? "text-amber-500"
        : "text-rose-500";

  // SVG math
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1.5 cursor-help select-none group",
            "text-xs font-medium text-muted-foreground transition-colors",
          )}
        >
          {/* Ring Container */}
          <div className="relative flex items-center justify-center">
            <svg className="h-4 w-4 -rotate-90 transform" viewBox="0 0 24 24">
              {/* 1. The Background Track (The "Empty" part) */}
              <circle
                className="text-foreground/10 group-hover:text-foreground/20 transition-colors"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />

              {/* 2. The Progress Indicator */}
              <circle
                className={cn(
                  "transition-all duration-500 ease-out",
                  colorClass,
                )}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />
            </svg>
          </div>

          <span className="tabular-nums opacity-60 group-hover:opacity-100 transition-opacity">
            {Math.round(percentage)}%
          </span>
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" className="text-xs font-mono">
        Context: {usage} used
      </TooltipContent>
    </Tooltip>
  );
};
