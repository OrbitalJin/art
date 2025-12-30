import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, MessageCircle, Pin } from "lucide-react";

interface Props {
  title: string;
  count: number;
  isPinned?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export const SessionSection: React.FC<Props> = ({
  title,
  count,
  isPinned = false,
  defaultCollapsed = false,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-2 text-xs font-medium text-muted-foreground cursor-pointer select-none",
          "hover:text-foreground transition-colors",
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {isPinned ? (
            <Pin className="h-3 w-3 text-primary" />
          ) : (
            <MessageCircle className="h-3 w-3" />
          )}
          <span>{title}</span>
          <span className="text-muted-foreground/60">({count})</span>
        </div>
        <ChevronRight className={cn("h-3 w-3", !collapsed && "rotate-90")} />
      </div>

      {!collapsed && <div className="space-y-1">{children}</div>}
    </div>
  );
};
