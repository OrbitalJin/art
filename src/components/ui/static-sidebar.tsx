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

interface StaticSidebarProps {
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  className?: string;
}

export const StaticSidebar: React.FC<StaticSidebarProps> = ({
  isOpen,
  onOpenChange,
  children,
  className,
}) => {
  useSidebarToggle(() => onOpenChange(!isOpen));

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onOpenChange(true)}
            className={cn(
              "hidden lg:flex bg-background/80 backdrop-blur m-2 opacity-70",
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
        "hidden lg:flex flex-col m-2",
        "rounded-md border bg-card/50 backdrop-blur-xl",
        "hover:border-primary/40",
        isOpen ? "min-w-[300px] w-[300px]" : "w-0 border-0",
        className,
      )}
    >
      {children}
    </aside>
  );
};
