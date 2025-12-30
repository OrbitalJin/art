import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { SidebarContent } from "./content";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export const StaticSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <div className="absolute top-2 left-2 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "hidden lg:flex bg-background/80 backdrop-blur shadow-sm transition-all",
                open && "opacity-0 pointer-events-none scale-90",
              )}
            >
              <PanelRight className="h-5 w-5" />
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
      </div>

      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 overflow-hidden m-2 will-change-transform",
          "rounded-xl border bg-card/50 backdrop-blur-xl shadow-xl",
          "hover:border-primary/40 transition-all duration-300 ease-in-out",
          open
            ? "w-[300px] opacity-100 scale-100"
            : "w-0 border-0 opacity-0 scale-90",
        )}
      >
        <div className="w-[300px] max-w-[85vw] h-full">
          <SidebarContent onClose={() => setOpen(false)} />
        </div>
      </aside>
    </>
  );
};
