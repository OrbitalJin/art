import React from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/use-calendar";
import { CalendarDay } from "./day";
import { TaskItem } from "./task-item";
import type { Task } from "@/lib/store/tasks/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const CalendarView: React.FC<Props> = ({ tasks, onTaskClick }) => {
  const {
    currentMonth,
    days,
    tasksWithoutDue,
    getTasksForDay,
    navigateMonth,
    goToToday,
  } = useCalendar(tasks);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg md:text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          <CalendarIcon className="h-4 w-4 mr-2" /> Today
        </Button>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-2 md:p-4 overflow-y-auto">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
            {days.map((day, idx) => (
              <CalendarDay
                key={idx}
                day={day}
                currentMonth={currentMonth}
                tasks={getTasksForDay(day)}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        </div>

        <div
          className={cn(
            "w-full lg:w-72 border-t lg:border-t-0 lg:border-l",
            "p-4 flex flex-col gap-3 overflow-y-auto h-[50%] md:h-[30%] lg:h-auto",
          )}
        >
          <h3 className="font-medium text-sm text-muted-foreground">
            No Due Date ({tasksWithoutDue.length})
          </h3>
          <div className="flex flex-col gap-2">
            {tasksWithoutDue.map((task) => (
              <TaskItem key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
