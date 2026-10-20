import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface TaskFormHeaderProps {
  mode: "create" | "edit";
  children?: ReactNode;
}

export const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({
  mode,
  children,
}) => {
  const title = mode === "edit" ? "Edit Task" : "New Task";
  const description =
    mode === "edit"
      ? "Update the details of this task."
      : "Capture what needs to be done.";

  return (
    <DialogHeader className="space-y-1 px-6 pt-6">
      <DialogTitle className="text-base font-semibold tracking-tight">
        {title}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        {description}
      </DialogDescription>
      {children}
    </DialogHeader>
  );
};
