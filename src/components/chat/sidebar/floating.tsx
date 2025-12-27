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

export const FloatingSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarToggle open={open} setOpen={setOpen} />
      <div
        className={cn(
          "absolute inset-0 z-40 lg:hidden transition-all duration-500 ease-in-out",
          open
            ? "bg-black/10 backdrop-blur-[2px] opacity-100"
            : "bg-transparent opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "absolute top-2 bottom-2 left-2 z-50 lg:hidden",
          "w-[85%] max-w-[350px] flex flex-col",
          "rounded-xl border bg-card/50 backdrop-blur-xl shadow-xl hover:border-primary/40",
          "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-[120%] opacity-0 scale-95",
        )}
      >
        <SidebarContent onSessionSwitch={() => setOpen(false)} />
      </div>
    </>
  );
};

interface ToggleProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarToggle: React.FC<ToggleProps> = ({ open, setOpen }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen(!open);
      }

      if (e.key === "Escape" && open) setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return (
    <div className="lg:hidden absolute top-2 left-2 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpen(true)}
            className={cn(
              "bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
              open && "opacity-0 pointer-events-none scale-90",
            )}
          >
            <PanelRight className="h-5 w-5" />
            <span className="sr-only">Open Sidebar (Alt+S)</span>
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
  );
};
