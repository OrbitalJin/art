import { LayoutGrid, CalendarDays } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectActions } from "@/components/tasks/project-actions";
import { TaskFormDialog } from "@/components/tasks/dialogs/task";
import { CalendarView } from "@/components/tasks/calendar/view";
import { useTasksStore } from "@/lib/store/use-tasks-store";

import { useTaskManager } from "@/hooks/use-task-manager";
import { TaskBoard } from "@/components/tasks/board/board";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import type { View } from "@/lib/store/tasks/types";

export const Tasks = () => {
  const manager = useTaskManager();
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const currentView = useTasksStore((state) => state.currentView);
  const setView = useTasksStore((state) => state.setView);

  return (
    <div className="flex h-full flex-1 flex-col p-2 gap-2">
      <div className="flex flex-row items-center gap-2">
        <TaskFormDialog
          mode="create"
          onSubmit={manager.createTask}
          projects={manager.projects}
          open={manager.isCreateDialogOpen}
          onOpenChange={manager.setIsCreateDialogOpen}
        />
        <ProjectActions />
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Tabs
                value={currentView}
                onValueChange={(v) => setView(v as View)}
              >
                <TabsList className="h-8 bg-muted/50 p-0.5">
                  <TabsTrigger value="board">
                    <LayoutGrid className="size-4" />
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarDays className="size-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <KbdGroup>
              <Kbd>Alt</Kbd>
              <span>+</span>
              <Kbd>T</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-hidden">
        {currentView === "board" ? (
          <TaskBoard tasks={manager.tasks} onEdit={manager.handleEditTask} />
        ) : (
          <CalendarView
            tasks={manager.tasks}
            onTaskClick={manager.handleEditTask}
            onDeleteTask={deleteTask}
            onEditTask={manager.handleEditTask}
          />
        )}
      </div>

      {manager.editingTask && (
        <TaskFormDialog
          mode="edit"
          task={manager.editingTask}
          open={manager.isEditDialogOpen}
          onOpenChange={manager.setIsEditDialogOpen}
          onSubmit={manager.updateTask}
          projects={manager.projects}
        />
      )}
    </div>
  );
};
