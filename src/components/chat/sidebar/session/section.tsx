import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          "flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-pointer select-none",
          "hover:text-foreground transition-colors",
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {isPinned && <Pin className="h-3 w-3 text-primary" />}
          <span>{title}</span>
          <span className="text-muted-foreground/60">({count})</span>
        </div>
        <button className="h-5 w-5 p-0 hover:bg-transparent">
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {!collapsed && <div className="space-y-1">{children}</div>}
    </div>
  );
};
