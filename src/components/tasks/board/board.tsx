import { useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import {
  COLUMN_LABELS,
  COLUMNS,
  type ColumnId,
  type Task,
  type TaskStatus,
} from "@/lib/store/tasks/types";
import { BoardColumn } from "@/components/tasks/board/column";
import { BoardItem } from "@/components/tasks/board/item";

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const sortByPosition = (items: Task[]) => {
  return [...items].sort((a, b) => a.position - b.position);
};

export const TaskBoard = ({ tasks, onEdit }: TaskBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const moveTaskToPosition = useTasksStore((state) => state.moveTaskToPosition);
  const reorderColumnTasks = useTasksStore((state) => state.reorderColumnTasks);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tasksByColumn = useMemo(() => {
    return Object.fromEntries(
      COLUMNS.map((colId) => [
        colId,
        sortByPosition(tasks.filter((task) => task.status === colId)),
      ]),
    ) as Record<ColumnId, Task[]>;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId((event.over?.id as string) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overTargetId = over.id as string;
    const overIsColumn = COLUMNS.includes(overTargetId as ColumnId);

    if (overIsColumn) {
      const destinationStatus = overTargetId as TaskStatus;
      const destinationItems = tasksByColumn[destinationStatus];
      const isSameColumn = activeTask.status === destinationStatus;

      if (isSameColumn) {
        const orderedIds = destinationItems.map((task) => task.id);
        const oldIndex = orderedIds.indexOf(activeTask.id);
        const newIndex = orderedIds.length - 1;

        if (oldIndex === -1 || oldIndex === newIndex) return;

        const reorderedIds = arrayMove(orderedIds, oldIndex, newIndex);
        reorderColumnTasks(destinationStatus, reorderedIds);
        return;
      }

      moveTaskToPosition(
        activeTask.id,
        destinationStatus,
        destinationItems.length,
      );
      return;
    }

    const overTask = tasks.find((task) => task.id === overTargetId);
    if (!overTask) return;

    const sourceStatus = activeTask.status;
    const destinationStatus = overTask.status;

    if (sourceStatus === destinationStatus) {
      const columnItems = tasksByColumn[sourceStatus];
      const oldIndex = columnItems.findIndex(
        (task) => task.id === activeTask.id,
      );
      const newIndex = columnItems.findIndex((task) => task.id === overTask.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(columnItems, oldIndex, newIndex);
      reorderColumnTasks(
        sourceStatus,
        reordered.map((task) => task.id),
      );
      return;
    }

    const destinationItems = tasksByColumn[destinationStatus];
    const overIndex = destinationItems.findIndex(
      (task) => task.id === overTask.id,
    );

    if (overIndex === -1) return;

    moveTaskToPosition(activeTask.id, destinationStatus, overIndex);
  };

  const activeItem = tasks.find((task) => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid h-full gap-2 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
        {COLUMNS.map((colId) => (
          <BoardColumn
            key={colId}
            id={colId}
            title={COLUMN_LABELS[colId]}
            items={tasksByColumn[colId]}
            overId={overId}
            onDelete={deleteTask}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && activeItem ? (
          <BoardItem item={activeItem} disabled />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
