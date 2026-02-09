import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import type { Task } from "@/lib/store/tasks/types";

export const useCalendar = (tasks: Task[]) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [currentMonth]);

  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.due) {
        const dateKey = new Date(task.due).toDateString();
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const tasksWithoutDue = React.useMemo(
    () => tasks.filter((t) => !t.due),
    [tasks],
  );

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
    );
  };

  const goToToday = () => setCurrentMonth(new Date());

  return {
    currentMonth,
    days,
    tasksWithoutDue,
    getTasksForDay: (day: Date) => tasksByDate.get(day.toDateString()) || [],
    navigateMonth,
    goToToday,
  };
};
