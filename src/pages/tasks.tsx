import React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import type { TaskStatus, ColumnId } from "@/lib/store/tasks/types";
import { COLUMN_LABELS, COLUMNS } from "@/lib/store/tasks/types";
import { TaskDialog } from "@/components/tasks/dialogs/tasks";
import { BoardColumn } from "@/components/tasks/board/column";
import { BoardItem } from "@/components/tasks/board/item";
import { ProjectActions } from "@/components/tasks/project-actions";

export const Tasks = () => {
  const tasks = useTasksStore((state) => state.tasks);
  const projects = useTasksStore((state) => state.projects);
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const createTask = useTasksStore((state) => state.createTask);
  const moveTask = useTasksStore((state) => state.moveTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragOver = (e: DragOverEvent) => {
    setOverId(e.over?.id as string | null);
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) =>
      activeProjectId === "inbox"
        ? !task.projectId
        : task.projectId === activeProjectId,
    );
  }, [tasks, activeProjectId]);

  const backlogTasks = React.useMemo(
    () => filteredTasks.filter((task) => task.status === "backlog"),
    [filteredTasks],
  );
  const inProgressTasks = React.useMemo(
    () => filteredTasks.filter((task) => task.status === "inProgress"),
    [filteredTasks],
  );
  const completedTasks = React.useMemo(
    () => filteredTasks.filter((task) => task.status === "completed"),
    [filteredTasks],
  );

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const isColumn = COLUMNS.includes(overId as ColumnId);

    if (isColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        moveTask(activeTask.id, newStatus);
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.status === overTask.status) {
        // Same column reordering - not implemented in store yet
        // Could add reorderTask method if needed
      } else if (overTask) {
        moveTask(activeTask.id, overTask.status);
      }
    }
  };

  const activeItem = tasks.find((t) => t.id === activeId);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex flex-row gap-2 items-center p-2 border-b border-border">
        <TaskDialog onSubmit={createTask} projects={projects} />
        <ProjectActions />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col lg:flex-row gap-2 p-2 flex-1 overflow-y-scroll">
          <BoardColumn
            id="backlog"
            title={COLUMN_LABELS.backlog}
            items={backlogTasks}
            overId={overId}
            onDelete={deleteTask}
          />
          <BoardColumn
            id="inProgress"
            title={COLUMN_LABELS.inProgress}
            items={inProgressTasks}
            overId={overId}
            onDelete={deleteTask}
          />
          <BoardColumn
            id="completed"
            title={COLUMN_LABELS.completed}
            items={completedTasks}
            overId={overId}
            onDelete={deleteTask}
          />
        </div>

        <DragOverlay>
          {activeId && activeItem ? <BoardItem item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
