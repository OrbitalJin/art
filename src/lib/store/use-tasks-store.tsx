import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { toast } from "sonner";
import type { Project, Task, TaskStatus, View } from "./tasks/types";
import { tasksStorage } from "./tasks/adapter";

export interface TasksState {
  tasks: Task[];
  projects: Project[];
  currentView: View;
  activeProjectId: string | "inbox";

  setView: (view: View) => void;

  // Task operations
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // Project operations
  createProject: (name: string, color?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (projectId: string | "inbox") => void;
}

const createNewTask = (
  task: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Task => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    ...task,
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

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [],
      currentView: "board",
      activeProjectId: "inbox",

      setView: (view) => set({ currentView: view }),

      createTask: (task) => {
        const newTask = createNewTask(task);
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
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              const updates: Partial<Task> = {
                status: newStatus,
                updatedAt: Date.now(),
              };
              if (newStatus === "completed" && !task.completedAt) {
                updates.completedAt = Date.now();
              } else if (newStatus !== "completed") {
                updates.completedAt = undefined;
              }
              return { ...task, ...updates };
            }
            return task;
          }),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        toast.success("Task deleted successfully");
      },

      createProject: (name: string, color?: string) => {
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

      deleteProject: (id: string) => {
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

      setActiveProject: (projectId: string | "inbox") => {
        set({ activeProjectId: projectId });
      },
    }),
    {
      name: "tasks-storage",
      version: 1,
      storage: createJSONStorage(() => tasksStorage),
    },
  ),
);
