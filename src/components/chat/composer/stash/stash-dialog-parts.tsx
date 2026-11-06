import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const stashDialogContentClassName = cn(
  "gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[480px]",
);

export const StashDialogHeader: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  const headerClassName = cn("border-b border-border/40 bg-muted/20 px-6 py-4");

  return (
    <DialogHeader className={headerClassName}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};

export const StashDialogBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex flex-col gap-4 px-6 py-5">{children}</div>;

export const StashDialogFooter: React.FC<{
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ hint, children }) => {
  const footerClassName = cn(
    "flex items-center justify-between gap-3",
    "border-t border-border/40 px-6 py-3",
  );

  return (
    <div className={footerClassName}>
      <div className="min-w-0">{hint}</div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
};

export const StashField: React.FC<{
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);
