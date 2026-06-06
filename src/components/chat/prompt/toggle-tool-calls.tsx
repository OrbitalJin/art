import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { PocketKnife } from "lucide-react";

export const ToggleToolCalls = () => {
  const showToolCalls = useSettingsStore((state) => state.showToolCalls);
  const setShowToolCalls = useSettingsStore((state) => state.setShowToolCalls);

  return (
    <DropdownMenu>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 transition-all",
                showToolCalls && "border-primary/50 bg-primary/5",
              )}
            >
              <PocketKnife
                className={cn(
                  "h-4 w-4 transition-colors",
                  showToolCalls ? "text-primary" : "text-muted-foreground",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Tool Calls</TooltipContent>
      </Tooltip>

      <DropdownMenuContent className="w-64 overflow-hidden border-muted-foreground/20 p-0 shadow-xl">
        <div
          className={cn(
            "flex flex-col gap-1 p-3 transition-colors cursor-pointer",
            showToolCalls
              ? "bg-primary/5 hover:bg-primary/10"
              : "bg-muted/30 hover:bg-accent/10",
          )}
          onClick={() => setShowToolCalls(!showToolCalls)}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Tool Calls</p>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold",
                showToolCalls
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground",
              )}
            >
              {showToolCalls ? "Visible" : "Hidden"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {showToolCalls
              ? "Tool calls are currently shown in the chat. Click to hide them."
              : "Tool calls are currently hidden. Click to show them."}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
