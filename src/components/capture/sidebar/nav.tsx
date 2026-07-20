import { useMemo } from "react";
import {
  Inbox,
  Link2,
  Star,
  StarOff,
  Text,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCaptureStore } from "@/lib/store/use-capture-store";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import type { CaptureFilter } from "@/lib/store/capture/types";

interface NavItem {
  value: CaptureFilter;
  label: string;
  icon: LucideIcon;
}

const STATUS_ITEMS: NavItem[] = [
  { value: "all", label: "All", icon: Inbox },
  { value: "starred", label: "Starred", icon: Star },
  { value: "unstarred", label: "Unstarred", icon: StarOff },
];

const KIND_ITEMS: NavItem[] = [
  { value: "text", label: "Text", icon: Text },
  { value: "link", label: "Links", icon: Link2 },
];

export const SidebarNav: React.FC = () => {
  const captures = useCaptureStore((state) => state.captures);
  const filter = useUIStateStore((state) => state.captureState.filter);
  const setCaptureState = useUIStateStore((state) => state.setCaptureState);

  const counts = useMemo<Record<CaptureFilter, number>>(() => {
    const starred = captures.filter((capture) => capture.starred).length;
    return {
      all: captures.length,
      starred,
      unstarred: captures.length - starred,
      text: captures.filter((capture) => capture.kind === "text").length,
      link: captures.filter((capture) => capture.kind === "link").length,
    };
  }, [captures]);

  const renderItem = (item: NavItem) => {
    const active = filter === item.value;
    return (
      <button
        key={item.value}
        type="button"
        onClick={() => setCaptureState({ filter: item.value })}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2",
          "text-sm select-none transition-all outline-none",
          "hover:bg-accent/30 hover:text-accent-foreground",
          active &&
            "bg-accent/20 font-medium text-accent-foreground ring-1 ring-inset ring-foreground/5",
        )}
      >
        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="flex-1 text-left text-foreground/80">
          {item.label}
        </span>
        <span className="text-xs text-muted-foreground/60">
          {counts[item.value]}
        </span>
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-2">
        <div className="space-y-1 py-2">
          {STATUS_ITEMS.map(renderItem)}
          <div className="flex items-center justify-between p-2 text-xs font-medium text-muted-foreground select-none">
            <span>Kinds</span>
          </div>
          {KIND_ITEMS.map(renderItem)}
        </div>
      </ScrollArea>
    </div>
  );
};
