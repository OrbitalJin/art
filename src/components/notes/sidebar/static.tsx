import { useNoteStore } from "@/lib/store/use-note-store";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Item } from "./item";

export const StaticSidebar = () => {
  const create = useNoteStore((state) => state.create);
  const activeId = useNoteStore((state) => state.activeId);
  const entries = useNoteStore((state) =>
    state.entries.sort((a, b) => b.updatedAt - a.updatedAt),
  );

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(true)}
            className={cn(
              "bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
              open && "opacity-0 pointer-events-none scale-90",
            )}
          >
            <PanelLeftOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Alt + S</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col h-full w-[380px] overflow-hidden",
        "transition-all rounded-xl border bg-card/50",
        "hover:border-primary/40",
        open ? "" : "w-0 border-0",
      )}
    >
      <div className="flex flex-row p-2 gap-2 border-b">
        <Button variant="outline" className="flex-1" onClick={() => create()}>
          <Plus></Plus>
          New Entry
        </Button>
        <Button size="icon" variant="outline" onClick={() => setOpen(false)}>
          <PanelLeftClose />
        </Button>
      </div>
      <div className="flex p-2 border-b">
        <div
          className={cn(
            "flex-1 flex flex-row p-2 gap-2 items-center",
            "bg-card border text-foreground/70 text-sm rounded-md",
          )}
        >
          <Search size={16} />
          <input
            className="outline-none flex-1"
            placeholder="Search entries..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-2 overflow-y-scroll">
        {entries.map((entry, index) => (
          <Item
            key={index}
            id={entry.id}
            title={entry.title}
            active={entry.id === activeId}
            updatedAt={entry.updatedAt}
          />
        ))}
      </div>
    </div>
  );
};
