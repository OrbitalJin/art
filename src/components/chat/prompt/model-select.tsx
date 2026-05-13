import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODELS } from "@/lib/llm/common/types";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

const getTierLabel = (tier?: number) => {
  switch (tier) {
    case 1:
      return "Fastest";
    case 2:
      return "Balanced";
    case 3:
      return "Smartest";
  }
};

export const SelectModel = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const setSessionModel = useSessionStore((store) => store.setModel);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isCurrentSessionStreaming } = useStreamingState();
  const model = MODELS.find((m) => m.id === session?.modelId);
  const [open, setOpen] = useState(false);

  const handleSelect = (key: string) => {
    if (session) {
      const m = MODELS.find((m) => m.id === key);
      if (m) setSessionModel(session.id, m.id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu key={activeId} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        disabled={isCurrentSessionStreaming}
        className="
        w-[120px] text-xs border cursor-pointer
        shadow-none focus:ring-0 transition-colors
        hover:bg-accent/30 hover:text-primary
        inline-flex items-center justify-between rounded-md px-3 py-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="truncate font-medium">{model?.displayName || "Model"}</span>
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5 opacity-50 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-80 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Models</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Select the best engine for your task.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {MODELS.map((m) => {
            const isSelected = model?.id === m.id;
            const label = getTierLabel(m.tier);

            return (
              <div
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={cn(
                  "flex flex-col p-2 gap-2 cursor-pointer rounded-sm transition-all duration-200 group",
                  isSelected
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/20",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {m.displayName}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 h-5 font-normal opacity-60 group-hover:opacity-100 transition-opacity",
                      isSelected &&
                        "opacity-100 border-primary/30 text-primary",
                    )}
                  >
                    {label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground/70 leading-snug pr-4">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
