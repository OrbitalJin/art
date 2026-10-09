import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/use-calendar";
import { CalendarDay } from "./day";
import { TaskItem } from "./task-item";
import type { Task } from "@/lib/store/tasks/types";

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const WeekdayLabel = ({ label }: { label: string }) => (
  <div className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:text-xs">
    {label}
  </div>
);

export const CalendarView: React.FC<Props> = ({
  tasks,
  onTaskClick,
  onEditTask,
}) => {
  const {
    currentMonth,
    days,
    tasksWithoutDue,
    getTasksForDay,
    navigateMonth,
    goToToday,
  } = useCalendar(tasks);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between bg-card/50 px-2 py-1 rounded-md border border-border/50">
        <div className="flex items-center">
          <h2 className="">{format(currentMonth, "MMMM yyyy")}</h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="size-8 rounded-xl text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
              className="size-8 rounded-full text-muted-foreground"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row gap-2">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mb-1 grid grid-cols-7 gap-1.5 bg-card/50 rounded-md border border-border/50">
            <WeekdayLabel label="Sun" />
            <WeekdayLabel label="Mon" />
            <WeekdayLabel label="Tue" />
            <WeekdayLabel label="Wed" />
            <WeekdayLabel label="Thu" />
            <WeekdayLabel label="Fri" />
            <WeekdayLabel label="Sat" />
          </div>
          <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-1.5">
            {days.map((day, idx) => (
              <CalendarDay
                key={idx}
                day={day}
                currentMonth={currentMonth}
                tasks={getTasksForDay(day)}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        </div>

        <div className="flex h-[40%] flex-col overflow-y-auto rounded-lg bg-card/50 lg:h-auto lg:w-72 lg:shrink-0 border border-border/50">
          <div className="flex items-center gap-2 p-4">
            <p className="text-sm font-medium">Undated</p>
            <span className="text-xs text-muted-foreground">
              {tasksWithoutDue.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 p-2">
            {tasksWithoutDue.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={onTaskClick}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
