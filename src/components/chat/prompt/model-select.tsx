import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Models, type Model } from "@/lib/llm/common/types";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export const SelectModel = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const setSessionModel = useSessionStore((store) => store.setModel);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isCurrentSessionStreaming } = useStreamingState();
  const model = session?.preferredModel as Model;
  const [open, setOpen] = useState(false);

  const handleSelect = (key: string) => {
    if (session) {
      const m = Models.find((m) => m.name === key);
      if (m) setSessionModel(session.id, m);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu key={activeId} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        disabled={isCurrentSessionStreaming}
        className="
        w-[140px] text-xs border cursor-pointer
        shadow-none focus:ring-0 transition-colors
        hover:bg-accent/30 hover:text-primary
        inline-flex items-center justify-between rounded-md px-3 py-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span>{model?.name || "Model"}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Models</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Choose a model.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {Models.map((m) => {
            const isSelected = model?.name === m.name;

            return (
              <div
                key={m.name}
                onClick={() => handleSelect(m.name)}
                className={`flex flex-col p-2.5 gap-0.5 cursor-pointer rounded-md transition-all duration-200 group ${
                  isSelected
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {m.name}
                  </span>
                  {isSelected && (
                    <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground animate-in zoom-in-75 duration-200">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  {m.description}
                </p>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
