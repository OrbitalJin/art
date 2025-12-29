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

export const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
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
                "bg-background/80 backdrop-blur shadow-sm transition-all",
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

      {/* Mobile backdrop */}
      <div
        className={cn(
          "lg:hidden absolute inset-0 z-40 transition-all duration-300",
          open
            ? "bg-black/10 backdrop-blur-[2px] opacity-100"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "absolute lg:relative z-50 lg:z-auto",
          "top-2 bottom-2 left-2 lg:top-auto lg:bottom-auto lg:left-auto",

          "flex flex-col shrink-0 overflow-hidden",
          "rounded-xl border bg-card/50 backdrop-blur-xl shadow-xl",
          "hover:border-primary/40 transition-all lg:duration-200 duration-300",

          "lg:translate-x-0",
          open
            ? "translate-x-0 opacity-100"
            : "-translate-x-[120%] opacity-0 lg:opacity-100 border-0",

          open ? "lg:w-[300px]" : "lg:w-0",
          "lg:ml-2 lg:my-2",
        )}
      >
        <div className="w-[300px] max-w-[85vw] h-full">
          <SidebarContent onSessionSwitch={() => setOpen(false)} />
        </div>
      </aside>
    </>
  );
};
