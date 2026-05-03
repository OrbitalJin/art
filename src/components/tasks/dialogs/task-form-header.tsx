import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface TaskFormHeaderProps {
  mode: "create" | "edit";
  children?: ReactNode;
}

export const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({
  mode,
  children,
}) => (
  <DialogHeader className="border-b bg-muted/30 px-6 pt-6 pb-4">
    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
      {mode === "edit" ? "Edit Task" : "New Task"}
    </DialogTitle>
    {children}
  </DialogHeader>
);
