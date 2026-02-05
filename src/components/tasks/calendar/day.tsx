import { format, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";
import { TaskItem } from "./task-item";

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const CalendarDay = ({
  day,
  currentMonth,
  tasks,
  onTaskClick,
}: CalendarDayProps) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={cn(
        "min-h-[80px] md:min-h-[120px] border border-border/50 rounded-md p-1 md:p-2 flex flex-col gap-1 relative",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isToday && "bg-primary/5 border-primary/30",
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={cn(
            "text-xs md:text-sm font-medium",
            isToday &&
              "bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center",
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      {/* Mobile: Dots */}
      <div className="flex xl:hidden flex-wrap content-start gap-1 p-0.5">
        {tasks.slice(0, 8).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={onTaskClick}
            variant="minimal"
          />
        ))}
      </div>

      {/* Desktop: List */}
      <div className="hidden xl:flex flex-1 flex-col gap-1 overflow-y-auto">
        {tasks.slice(0, 3).map((task) => (
          <TaskItem key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {tasks.length > 3 && (
          <div className="text-xs text-muted-foreground text-center">
            +{tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};
