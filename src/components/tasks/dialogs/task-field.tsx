import type { ReactNode } from "react";

interface TaskFieldProps {
  label: string;
  children: ReactNode;
}

export const TaskField = ({ label, children }: TaskFieldProps) => (
  <div className="min-w-0 space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);
