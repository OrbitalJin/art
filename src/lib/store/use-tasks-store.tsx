import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Project, Task, TaskStatus, View } from "./tasks/types";
import { tasksStorage } from "./tasks/adapter";

export interface TasksState {
  tasks: Task[];
  projects: Project[];
  currentView: View;
  activeProjectId: string | "inbox";
  inboxName: string;

  setView: (view: View) => void;
  setInboxName: (name: string) => void;

  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "position">,
  ) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  moveTaskToPosition: (
    taskId: string,
    toStatus: TaskStatus,
    toIndex: number,
  ) => void;
  reorderColumnTasks: (status: TaskStatus, orderedTaskIds: string[]) => void;
  deleteTask: (id: string) => void;

  createProject: (name: string, color?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (projectId: string | "inbox") => void;
}

const createNewTask = (
  task: Omit<Task, "id" | "createdAt" | "updatedAt" | "position">,
  position: number,
): Task => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    ...task,
    position,
    createdAt: now,
    updatedAt: now,
  };
};

const createNewProject = (name: string, color?: string): Project => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: now,
    updatedAt: now,
  };
};

const sortByPosition = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => a.position - b.position);
};

const normalizeColumnPositions = (
  tasks: Task[],
  status: TaskStatus,
): Task[] => {
  const columnTasks = sortByPosition(
    tasks.filter((task) => task.status === status),
  );
  const positionMap = new Map(
    columnTasks.map((task, index) => [task.id, index]),
  );

  return tasks.map((task) => {
    if (task.status !== status) return task;

    return {
      ...task,
      position: positionMap.get(task.id) ?? task.position,
    };
  });
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      currentView: "board",
      activeProjectId: "inbox",
      inboxName: "Inbox",

      setView: (view) => set({ currentView: view }),
      setInboxName: (name) => set({ inboxName: name }),

      createTask: (task) => {
        const state = get();
        const sameColumnTasks = state.tasks.filter(
          (t) => t.status === task.status,
        );
        const nextPosition =
          sameColumnTasks.length > 0
            ? Math.max(...sameColumnTasks.map((t) => t.position)) + 1
            : 0;

        const newTask = createNewTask(task, nextPosition);

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        toast.success("Task created successfully");
        return newTask.id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: Date.now() }
              : task,
          ),
        }));

        toast.success("Task updated successfully");
      },

      moveTask: (id, newStatus) => {
        const state = get();
        const targetTasks = state.tasks.filter((t) => t.status === newStatus);
        const nextPosition =
          targetTasks.length > 0
            ? Math.max(...targetTasks.map((t) => t.position)) + 1
            : 0;

        set((state) => {
          const movedTask = state.tasks.find((task) => task.id === id);
          if (!movedTask) return state;

          const updatedTasks = state.tasks.map((task) => {
            if (task.id !== id) return task;

            const updates: Partial<Task> = {
              status: newStatus,
              position: nextPosition,
              updatedAt: Date.now(),
            };

            if (newStatus === "completed" && !task.completedAt) {
              updates.completedAt = Date.now();
            } else if (newStatus !== "completed") {
              updates.completedAt = undefined;
            }

            return { ...task, ...updates };
          });

          const normalizedTasks = normalizeColumnPositions(
            updatedTasks,
            movedTask.status,
          );

          return {
            ...state,
            tasks:
              movedTask.status === newStatus
                ? updatedTasks
                : normalizeColumnPositions(normalizedTasks, newStatus),
          };
        });
      },

      reorderColumnTasks: (status, orderedTaskIds) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.status !== status) return task;

            const index = orderedTaskIds.indexOf(task.id);
            if (index === -1) return task;

            return {
              ...task,
              position: index,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      moveTaskToPosition: (taskId, toStatus, toIndex) => {
        set((state) => {
          const taskToMove = state.tasks.find((task) => task.id === taskId);
          if (!taskToMove) return state;

          const fromStatus = taskToMove.status;

          const remainingTasks = state.tasks.filter(
            (task) => task.id !== taskId,
          );

          const targetColumnTasks = sortByPosition(
            remainingTasks.filter((task) => task.status === toStatus),
          );

          const clampedIndex = Math.max(
            0,
            Math.min(toIndex, targetColumnTasks.length),
          );

          const movedTask: Task = {
            ...taskToMove,
            status: toStatus,
            position: clampedIndex,
            updatedAt: Date.now(),
            completedAt:
              toStatus === "completed"
                ? (taskToMove.completedAt ?? Date.now())
                : undefined,
          };

          targetColumnTasks.splice(clampedIndex, 0, movedTask);

          const targetPositionMap = new Map(
            targetColumnTasks.map((task, index) => [task.id, index]),
          );

          let nextTasks = remainingTasks.map((task) => {
            if (task.status !== toStatus) return task;

            return {
              ...task,
              position: targetPositionMap.get(task.id) ?? task.position,
              updatedAt: Date.now(),
            };
          });

          nextTasks.push({
            ...movedTask,
            position: clampedIndex,
          });

          nextTasks = normalizeColumnPositions(nextTasks, toStatus);

          if (fromStatus !== toStatus) {
            nextTasks = normalizeColumnPositions(nextTasks, fromStatus);
          }

          return {
            ...state,
            tasks: nextTasks,
          };
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const nextTasks = state.tasks.filter((t) => t.id !== id);

          return {
            ...state,
            tasks: normalizeColumnPositions(nextTasks, task.status),
          };
        });

        toast.success("Task deleted successfully");
      },

      createProject: (name, color) => {
        const newProject = createNewProject(name, color);

        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));

        toast.success("Project created successfully");
        return newProject.id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: Date.now() }
              : project,
          ),
        }));

        toast.success("Project updated successfully");
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.map((task) =>
            task.projectId === id
              ? { ...task, projectId: undefined, updatedAt: Date.now() }
              : task,
          ),
          activeProjectId:
            state.activeProjectId === id ? "inbox" : state.activeProjectId,
        }));

        toast.success("Project deleted successfully");
      },

      setActiveProject: (projectId) => {
        set({ activeProjectId: projectId });
      },
    }),
    {
      name: "tasks-storage",
      version: 3,
      storage: createJSONStorage(() => tasksStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<TasksState>;

        if (version < 3) {
          const tasks = state.tasks ?? [];
          const counters = new Map<TaskStatus, number>();

          const migratedTasks = tasks.map((task) => {
            const existing = counters.get(task.status) ?? 0;
            counters.set(task.status, existing + 1);

            return {
              ...task,
              position:
                typeof task.position === "number" ? task.position : existing,
            };
          });

          return {
            ...state,
            inboxName: state.inboxName ?? "Inbox",
            tasks: migratedTasks,
          };
        }

        return state;
      },
    },
  ),
);
