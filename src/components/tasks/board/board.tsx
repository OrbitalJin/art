import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowRightLeft } from "lucide-react";

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const MobileDropZone = ({
  colId,
  label,
}: {
  colId: ColumnId;
  label: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${colId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex flex-1 items-stretch justify-center transition-all duration-200 z-10",
        "border-l border-primary/10 first:border-l-0",
        isOver
          ? "z-10 scale-[1.02] bg-primary text-primary-foreground shadow-inner"
          : "bg-background text-muted-foreground",
      )}
    >
      <div className="flex min-h-[96px] w-full flex-col items-center justify-center px-2 py-3">
        <ArrowRightLeft
          className={cn("mb-1 size-5", isOver ? "animate-pulse" : "opacity-50")}
        />
        <span className="px-1 text-center text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
};

export const TaskBoard = ({ tasks, onEdit }: TaskBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ColumnId>(COLUMNS[0]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const moveTaskToPosition = useTasksStore((state) => state.moveTaskToPosition);
  const reorderColumnTasks = useTasksStore((state) => state.reorderColumnTasks);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
  );

  useEffect(() => {
    const checkSize = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const tasksByColumn = useMemo(() => {
    const sortByPos = (items: Task[]) =>
      [...items].sort((a, b) => a.position - b.position);

    return Object.fromEntries(
      COLUMNS.map((colId) => [
        colId,
        sortByPos(tasks.filter((task) => task.status === colId)),
      ]),
    ) as Record<ColumnId, Task[]>;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overTargetId = over.id as string;

    if (overTargetId.startsWith("zone-")) {
      const destStatus = overTargetId.replace("zone-", "") as TaskStatus;

      if (activeTask.status !== destStatus) {
        moveTaskToPosition(
          activeTask.id,
          destStatus,
          tasksByColumn[destStatus].length,
        );
        setActiveTab(destStatus as ColumnId);
      }

      return;
    }

    const overIsColumn = COLUMNS.includes(overTargetId as ColumnId);

    if (overIsColumn) {
      const destStatus = overTargetId as TaskStatus;

      if (activeTask.status === destStatus) {
        const ids = tasksByColumn[destStatus].map((t) => t.id);
        reorderColumnTasks(
          destStatus,
          arrayMove(ids, ids.indexOf(activeTask.id), ids.length - 1),
        );
      } else {
        moveTaskToPosition(
          activeTask.id,
          destStatus,
          tasksByColumn[destStatus].length,
        );
      }

      return;
    }

    const overTask = tasks.find((task) => task.id === overTargetId);
    if (!overTask) return;

    const sourceStatus = activeTask.status;
    const destStatus = overTask.status;

    if (sourceStatus === destStatus) {
      const items = tasksByColumn[sourceStatus];
      const oldIdx = items.findIndex((t) => t.id === activeTask.id);
      const newIdx = items.findIndex((t) => t.id === overTask.id);

      reorderColumnTasks(
        sourceStatus,
        arrayMove(
          items.map((t) => t.id),
          oldIdx,
          newIdx,
        ),
      );
    } else {
      const destItems = tasksByColumn[destStatus];
      const overIndex = destItems.findIndex((t) => t.id === overTask.id);
      moveTaskToPosition(activeTask.id, destStatus, overIndex);
    }
  };

  const activeItem = tasks.find((task) => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        {isLargeScreen ? (
          <div className="grid h-full gap-2 overflow-y-auto lg:grid-cols-3">
            {COLUMNS.map((colId) => (
              <BoardColumn
                key={colId}
                id={colId}
                title={COLUMN_LABELS[colId]}
                items={tasksByColumn[colId]}
                overId={null}
                onDelete={deleteTask}
                onEdit={onEdit}
              />
            ))}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ColumnId)}
            className="flex h-full flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              {COLUMNS.map((colId) => (
                <TabsTrigger key={colId} value={colId} className="text-xs">
                  {COLUMN_LABELS[colId]}
                </TabsTrigger>
              ))}
            </TabsList>

            {COLUMNS.map((colId) => (
              <TabsContent
                key={colId}
                value={colId}
                className="mt-2 flex-1 overflow-hidden"
              >
                <BoardColumn
                  id={colId}
                  title={COLUMN_LABELS[colId]}
                  items={tasksByColumn[colId]}
                  overId={null}
                  onDelete={deleteTask}
                  onEdit={onEdit}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        {!isLargeScreen && activeId && (
          <div className="fixed inset-x-0 bottom-0 z-[100] animate-in px-4 pb-8 slide-in-from-bottom-full duration-200">
            <div className="flex h-24 w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-[0_-10px_50px_rgba(0,0,0,0.3)]">
              {COLUMNS.map((colId) => (
                <MobileDropZone
                  key={colId}
                  colId={colId}
                  label={COLUMN_LABELS[colId]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId && activeItem ? (
          <div className="pointer-events-none scale-70 md:scale-100 opacity-80 shadow-2xl">
            <BoardItem item={activeItem} disabled />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
