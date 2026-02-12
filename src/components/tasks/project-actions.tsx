import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTasksStore } from "@/lib/store/use-tasks-store";
import type { Project } from "@/lib/store/tasks/types";
import { cn } from "@/lib/utils";
import {
  Folder,
  Inbox,
  Trash2,
  Pencil,
  FolderOpen,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { ProjectFormDialog } from "./dialogs/project";

export const ProjectActions = () => {
  const setActiveProject = useTasksStore((state) => state.setActiveProject);
  const projects = useTasksStore((state) => state.projects);
  const activeProjectId = useTasksStore((state) => state.activeProjectId);
  const deleteProject = useTasksStore((state) => state.deleteProject);
  const createProject = useTasksStore((state) => state.createProject);
  const updateProject = useTasksStore((state) => state.updateProject);

  const [menuOpen, setMenuOpen] = useState(false); // Controls dropdown visibility
  const [query, setQuery] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const filtered = !query
    ? projects
    : projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

  const handleSelectProject = (id: string | "inbox") => {
    setActiveProject(id);
    setMenuOpen(false); // Close the menu when a project is selected
    setQuery(""); // Reset search on close
  };

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsEditDialogOpen(true);
    setMenuOpen(false); // Close dropdown to show edit dialog
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjectToDelete(id);
    setMenuOpen(false); // Close dropdown to show delete confirmation
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative flex items-center gap-2 px-3 h-9 min-w-[140px] justify-between transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {activeProjectId === "inbox" ? (
                <Inbox className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <FolderOpen
                  className={cn("w-4 h-4 shrink-0", activeProject?.color)}
                />
              )}
              <span className="text-sm font-medium truncate">
                {activeProjectId === "inbox" ? "Inbox" : activeProject?.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80 p-0 shadow-xl border-muted-foreground/20"
          align="start"
        >
          <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
            <p className="text-sm font-medium">Projects</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Select a project to view tasks or manage your folders.
            </p>
          </div>

          <div className="p-2 border-b">
            <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search projects..."
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col p-2 gap-1 max-h-[350px] overflow-y-auto">
            {!query && (
              <div
                onClick={() => handleSelectProject("inbox")}
                className={cn(
                  "flex items-center justify-between p-2 cursor-pointer rounded-sm transition-all duration-200",
                  activeProjectId === "inbox"
                    ? "bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Inbox</p>
                </div>
              </div>
            )}

            {filtered.map((project) => {
              const isSelected = activeProjectId === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={cn(
                    "flex flex-col p-2 gap-2 cursor-pointer rounded-sm transition-all duration-200 group",
                    isSelected
                      ? "bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {isSelected ? (
                        <FolderOpen
                          className={cn("w-4 h-4 shrink-0", project.color)}
                        />
                      ) : (
                        <Folder
                          className={cn("w-4 h-4 shrink-0", project.color)}
                        />
                      )}
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => handleEdit(e, project)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, project.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-2 border-t bg-muted/10">
            <ProjectFormDialog
              mode="create"
              onSubmit={(updates) => {
                createProject(updates);
                setMenuOpen(false); // Close menu when creating
              }}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-muted-foreground hover:text-primary"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Project
                </Button>
              }
            />
            <p className="text-[10px] text-muted-foreground px-2">
              {projects.length} total
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* External Dialogs (Triggered by closing the menu first) */}
      {editingProject && (
        <ProjectFormDialog
          mode="edit"
          project={editingProject}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={updateProject}
        />
      )}

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (projectToDelete) {
                  deleteProject(projectToDelete);
                  setProjectToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
