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
import type { TaskStatus, ColumnId, Task } from "@/lib/store/tasks/types";
import { COLUMN_LABELS, COLUMNS } from "@/lib/store/tasks/types";
import { TaskDialog } from "@/components/tasks/dialogs/tasks";
import { EditTaskDialog } from "@/components/tasks/dialogs/edit-task";
import { BoardColumn } from "@/components/tasks/board/column";
import { BoardItem } from "@/components/tasks/board/item";
import { ProjectActions } from "@/components/tasks/project-actions";
import { CalendarView } from "@/components/tasks/calendar/view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, LayoutGrid } from "lucide-react";


export const Tasks = () => {
  const tasks = useTasksStore((state) => state.tasks);
  const projects = useTasksStore((state) => state.projects);
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const createTask = useTasksStore((state) => state.createTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const moveTask = useTasksStore((state) => state.moveTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState("board");
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-2 gap-2 ">
      <div className="flex flex-row gap-2 items-center p-2 border rounded-md opacity-80 hover:opacity-100 transition-opacity">
        <TaskDialog onSubmit={createTask} projects={projects} />
        <ProjectActions />
        <div className="flex-1" />
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="board" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeView === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid md:grid-cols-2 md:grid-row-2 lg:grid-cols-3 gap-2 h-full overflow-y-auto">
              <BoardColumn
                id="backlog"
                title={COLUMN_LABELS.backlog}
                items={backlogTasks}
                overId={overId}
                onDelete={deleteTask}
                onEdit={handleEditTask}
              />
              <BoardColumn
                id="inProgress"
                title={COLUMN_LABELS.inProgress}
                items={inProgressTasks}
                overId={overId}
                onDelete={deleteTask}
                onEdit={handleEditTask}
              />
              <BoardColumn
                className="md:col-span-2 lg:col-span-1"
                id="completed"
                title={COLUMN_LABELS.completed}
                items={completedTasks}
                overId={overId}
                onDelete={deleteTask}
                onEdit={handleEditTask}
              />
            </div>

            <DragOverlay>
              {activeId && activeItem ? <BoardItem item={activeItem} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={handleEditTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
          />
        )}
      </div>

      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateTask}
        projects={projects}
      />
    </div>
  );
};
