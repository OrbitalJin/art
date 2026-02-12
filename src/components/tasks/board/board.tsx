import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import {
  COLUMN_LABELS,
  COLUMNS,
  type ColumnId,
  type TaskStatus,
  type Task,
} from "@/lib/store/tasks/types";
import { BoardColumn } from "@/components/tasks/board/column";
import { BoardItem } from "@/components/tasks/board/item";

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export const TaskBoard = ({ tasks, onEdit }: TaskBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const moveTask = useTasksStore((state) => state.moveTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(e.active.id as string);
  const handleDragOver = (e: DragOverEvent) =>
    setOverId(e.over?.id as string | null);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);

    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTargetId = over.id as string;
    const isColumn = COLUMNS.includes(overTargetId as ColumnId);

    if (isColumn) {
      moveTask(activeTask.id, overTargetId as TaskStatus);
    } else {
      const overTask = tasks.find((t) => t.id === overTargetId);
      if (overTask) moveTask(activeTask.id, overTask.status);
    }
  };

  const activeItem = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 h-full overflow-y-auto">
        {COLUMNS.map((colId) => (
          <BoardColumn
            key={colId}
            id={colId}
            title={COLUMN_LABELS[colId]}
            items={tasks.filter((t) => t.status === colId)}
            overId={overId}
            onDelete={deleteTask}
            onEdit={onEdit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId && activeItem ? <BoardItem item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
