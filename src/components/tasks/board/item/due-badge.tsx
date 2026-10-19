import { addDays, isBefore, isSameDay, startOfDay } from "date-fns";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const DueBadge = ({ due }: { due: string }) => {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(due));

  const isOverDue = isBefore(dueDate, today);
  const isDueToday = isSameDay(dueDate, today);
  const isDueTomorrow = isSameDay(dueDate, addDays(today, 1));

  const label = isDueToday
    ? "Today"
    : isDueTomorrow
      ? "Tomorrow"
      : new Date(due).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

  const tone = isOverDue
    ? "bg-red-500/10 text-red-600 dark:text-red-400"
    : isDueToday || isDueTomorrow
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-muted text-muted-foreground";

  const icon = isOverDue ? (
    <AlertCircle className="size-3" />
  ) : isDueToday || isDueTomorrow ? (
    <Clock className="size-3" />
  ) : (
    <Calendar className="size-3" />
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone,
      )}
    >
      {icon}
      <span>
        {isOverDue && "Overdue · "}
        {label}
      </span>
    </div>
  );
};
