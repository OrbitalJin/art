import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

export const SidebarFooter = () => {
  const open = useUIStateStore((state) => state.settingsDialogOpen);
  const setOpen = useUIStateStore((state) => state.setSettingsDialogOpen);

  return (
    <div className="flex flex-col gap-2 px-2 mt-auto">
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
          open && "text-foreground bg-accent",
        )}
        onClick={() => setOpen(true)}
        aria-label="Settings"
      >
        <Settings2 size={20} />
      </Button>
    </div>
  );
};
