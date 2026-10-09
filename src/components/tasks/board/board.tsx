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
import { getUnmetDependencies } from "@/lib/tasks/dependency-utils";
import { toast } from "sonner";
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

  const zoneStyle = isOver
    ? "bg-primary text-primary-foreground"
    : "bg-muted/50 text-muted-foreground";

  const iconStyle = isOver ? "animate-pulse" : "opacity-50";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors duration-200",
        zoneStyle,
      )}
    >
      <ArrowRightLeft className={cn("size-4", iconStyle)} />
      <span className="text-center text-[10px] font-medium uppercase tracking-wider">
        {label}
      </span>
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
        if (destStatus === "completed") {
          const unmetDeps = getUnmetDependencies(activeTask, tasks);
          if (unmetDeps.length > 0) {
            toast.error("Cannot complete task", {
              description: "All dependencies must be completed first.",
            });
            return;
          }
        }
        moveTaskToPosition(activeTask.id, destStatus, 0);
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
        if (destStatus === "completed") {
          const unmetDeps = getUnmetDependencies(activeTask, tasks);
          if (unmetDeps.length > 0) {
            toast.error("Cannot complete task", {
              description: "All dependencies must be completed first.",
            });
            return;
          }
        }
        moveTaskToPosition(activeTask.id, destStatus, 0);
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
      if (destStatus === "completed") {
        const unmetDeps = getUnmetDependencies(activeTask, tasks);
        if (unmetDeps.length > 0) {
          toast.error("Cannot complete task", {
            description: `Unmet dependencies: ${unmetDeps.map((d) => d.title).join(", ")}`,
          });
          return;
        }
      }
      moveTaskToPosition(activeTask.id, destStatus, 0);
    }
  };

  const activeItem = tasks.find((task) => task.id === activeId);
  const showMobileDropZones = !isLargeScreen && activeId;

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
          <div className="grid h-full grid-cols-3 gap-3 overflow-hidden">
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
            <TabsList className="mx-4 grid w-auto grid-cols-3 rounded-full bg-muted/50">
              {COLUMNS.map((colId) => (
                <TabsTrigger
                  key={colId}
                  value={colId}
                  className="rounded-full text-xs"
                >
                  {COLUMN_LABELS[colId]}
                </TabsTrigger>
              ))}
            </TabsList>

            {COLUMNS.map((colId) => (
              <TabsContent
                key={colId}
                value={colId}
                className="mt-3 flex-1 overflow-hidden px-4 pb-4"
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

        {showMobileDropZones && (
          <div className="fixed inset-x-0 bottom-0 z-100 animate-in px-4 pb-8 slide-in-from-bottom-full duration-200">
            <div className="flex h-20 w-full gap-1.5 rounded-3xl bg-background/80 p-1.5 shadow-2xl ring-1 ring-border backdrop-blur-xl">
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
          <div className="pointer-events-none scale-70 opacity-90 lg:scale-100">
            <BoardItem item={activeItem} isOverlay disabled />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
