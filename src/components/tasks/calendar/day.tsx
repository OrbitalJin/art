import { format, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/tasks/types";
import { TaskItem } from "./task-item";

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask?: (task: Task) => void;
}

export const CalendarDay = ({
  day,
  currentMonth,
  tasks,
  onTaskClick,
  onEditTask,
}: CalendarDayProps) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const overflowCount = tasks.length - 3;

  return (
    <div
      className={cn(
        "relative flex min-h-[80px] flex-col gap-1 rounded-xl bg-muted/20 p-1.5 transition-colors hover:bg-muted/40 md:min-h-[120px] md:p-2",
        !isCurrentMonth && "bg-transparent opacity-40",
        isToday && "bg-primary/5 ring-1 ring-primary/30 hover:bg-primary/10",
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium text-muted-foreground md:text-sm",
            isToday &&
              "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground md:size-6",
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      {/* Mobile: Dots */}
      <div className="flex flex-wrap content-start gap-1 p-0.5 xl:hidden">
        {tasks.slice(0, 8).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onEdit={onEditTask}
            variant="minimal"
          />
        ))}
      </div>

      {/* Desktop: List */}
      <div className="hidden flex-1 flex-col gap-1 overflow-y-auto xl:flex">
        {tasks.slice(0, 3).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onEdit={onEditTask}
          />
        ))}
        {overflowCount > 0 && (
          <div className="text-center text-[11px] text-muted-foreground">
            +{overflowCount} more
          </div>
        )}
      </div>
    </div>
  );
};
