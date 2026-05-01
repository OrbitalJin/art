import { cn } from "@/lib/utils";
import { ChevronRight, Pin, Scroll, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  count: number;
  isPinned?: boolean;
  open?: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export const Section: React.FC<Props> = ({
  title,
  count,
  icon: Icon,
  isPinned = false,
  open = false,
  setOpen,
  children,
}) => {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-2",
          "hover:text-foreground transition-colors",
          "text-xs font-medium text-muted-foreground cursor-pointer select-none",
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {Icon ? (
            <Icon className="h-3 w-3" />
          ) : isPinned ? (
            <Pin className="h-3 w-3 text-primary" />
          ) : (
            <Scroll className="h-3 w-3" />
          )}
          <span>{title}</span>
          <span className="text-muted-foreground/60">({count})</span>
        </div>
        <ChevronRight className={cn("h-3 w-3", open && "rotate-90")} />
      </div>

      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
};
