import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";

const UrgencyDot = ({ dot, label }: { dot: string; label: string }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-medium capitalize text-muted-foreground">
    <span className={cn("size-1.5 rounded-full", dot)} />
    {label}
  </div>
);

export const UrgencyIndicator = ({ urgency }: { urgency: Task["urgency"] }) => {
  if (urgency === "low") return <UrgencyDot dot="bg-green-500" label="low" />;
  if (urgency === "medium")
    return <UrgencyDot dot="bg-amber-500" label="medium" />;
  if (urgency === "high")
    return <UrgencyDot dot="bg-red-500" label="high" />;
  return <div className="h-5" />;
};
