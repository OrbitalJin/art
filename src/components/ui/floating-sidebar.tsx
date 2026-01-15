import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

interface FloatingSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  isOpen,
  onOpenChange,
  children,
}) => {
  return (
    <>
      <SidebarToggle open={isOpen} onOpenChange={onOpenChange} />
      <div
        className={cn(
          "absolute inset-0 z-40 lg:hidden transition-all duration-500 ease-in-out",
          isOpen
            ? "bg-black/10 backdrop-blur-[2px] opacity-100"
            : "bg-transparent opacity-0 pointer-events-none",
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          "absolute top-2 bottom-2 left-2 z-50 lg:hidden",
          "w-[85%] max-w-[350px] flex flex-col",
          "rounded-xl border bg-background shadow-xl hover:border-primary/40",
          "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-[120%] opacity-0 scale-85",
        )}
      >
        {children}
      </div>
    </>
  );
};

const SidebarToggle: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  useSidebarToggle(() => onOpenChange(!open));

  return (
    <div className="lg:hidden absolute top-2 left-2 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onOpenChange(true)}
            className={cn(
              "bg-background/80 backdrop-blur shadow-sm transition-all duration-300 opacity-70",
              open && "opacity-0 pointer-events-none scale-90",
            )}
          >
            <PanelLeftOpen className="h-5 w-5" />
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
