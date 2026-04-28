import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import type { Task } from "@/lib/store/tasks/types";

export const useTaskManager = () => {
  const tasks = useTasksStore((state) => state.tasks);
  const projects = useTasksStore((state) => state.projects);
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const createTask = useTasksStore((state) => state.createTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const setView = useTasksStore((state) => state.setView);
  const currentView = useTasksStore((state) => state.currentView);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setView(currentView === "board" ? "calendar" : "board");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, setView]);

  // Handle URL Trigger
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      activeProjectId === "inbox"
        ? !task.projectId
        : task.projectId === activeProjectId,
    );
  }, [tasks, activeProjectId]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  return {
    tasks: filteredTasks,
    projects,
    editingTask,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleEditTask,
    createTask,
    updateTask,
  };
};
