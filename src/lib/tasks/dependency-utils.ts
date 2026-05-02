import type { Task } from "@/lib/store/tasks/types";

export const hasUnmetDependencies = (
  task: Task,
  allTasks: Task[],
): boolean => {
  if (!task.dependencies || task.dependencies.length === 0) return false;

  return task.dependencies.some((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return !depTask || depTask.status !== "completed";
  });
};

export const getUnmetDependencies = (
  task: Task,
  allTasks: Task[],
): Task[] => {
  if (!task.dependencies) return [];

  return task.dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter(
      (dep): dep is Task =>
        dep !== undefined && dep.status !== "completed",
    );
};
