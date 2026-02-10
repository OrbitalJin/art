import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import type { Project } from "@/lib/store/tasks/types";
import { cn } from "@/lib/utils";
import { Folder, Inbox, Trash2, Pencil, FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { ProjectDialog } from "./dialogs/project";
import { EditProjectDialog } from "./dialogs/edit-project";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const ProjectActions = () => {
  const setActiveProject = useTasksStore((state) => state.setActiveProject);
  const projects = useTasksStore((state) => state.projects);
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const deleteProject = useTasksStore((state) => state.deleteProject);
  const createProject = useTasksStore((state) => state.createProject);
  const updateProject = useTasksStore((state) => state.updateProject);

  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleEditProject = () => {
    if (activeProjectId === "inbox") return;
    const project = projects.find((p) => p.id === activeProjectId);
    if (project) {
      setEditingProject(project);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    updateProject(id, updates);
  };

  return (
    <div className="flex items-center gap-2">
      <ProjectDialog onSubmit={createProject} />
      <Select
        value={activeProjectId}
        onValueChange={(v) => setActiveProject(v as string | "inbox")}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inbox">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                {project.id === activeProjectId ? (
                  <FolderOpen className={cn(project.color)} />
                ) : (
                  <Folder className={cn(project.color)} />
                )}
                {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeProjectId !== "inbox" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={handleEditProject}>
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit project</p>
          </TooltipContent>
        </Tooltip>
      )}

      {activeProjectId !== "inbox" && (
        <AlertDialog>
          <AlertDialogTrigger>
            <Tooltip>
              <TooltipTrigger>
                <Button size="icon" variant="outline">
                  <Trash2 className="w-4 h-4 text-destructive/80" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete project</p>
              </TooltipContent>
            </Tooltip>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteProject(activeProjectId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <EditProjectDialog
        project={editingProject}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProject}
      />
    </div>
  );
};
