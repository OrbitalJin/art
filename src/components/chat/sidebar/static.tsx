import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import { SidebarContent } from "./content";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export const StaticSidebar: React.FC = () => {
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
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "hidden lg:flex bg-background/80 backdrop-blur shadow-sm transition-all m-2 opacity-70",
            )}
          >
            <PanelLeftOpen className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar (Alt+S)</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <KbdGroup>
            <Kbd>Alt</Kbd>
            <span>+</span>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 overflow-hidden m-2 will-change-transform",
        "rounded-xl border bg-card/50 backdrop-blur-xl shadow-xl",
        "hover:border-primary/40",
        open ? "w-[300px]" : "w-0 border-0",
      )}
    >
      <div className="w-[300px] max-w-[85vw] h-full">
        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </aside>
  );
};
