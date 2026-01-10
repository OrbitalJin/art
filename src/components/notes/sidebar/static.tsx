import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/lib/store/notes/types";
import { SidebarContent } from "@/components/notes/sidebar/content";

interface Props {
  currentTab: Workspace;
  setCurrentTab: (tab: Workspace) => void;
}

export const StaticSidebar: React.FC<Props> = ({
  currentTab,
  setCurrentTab,
}) => {
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
              "hidden lg:flex bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
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
      <SidebarContent
        setOpen={setOpen}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
    </div>
  );
};
