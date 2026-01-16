import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const SidebarFooter = () => {
  const settingsDialogOpen = useSettingsStore((state) => state.settingsDialogOpen);
  const setSettingsDialogOpen = useSettingsStore((state) => state.setSettingsDialogOpen);

  return (
    <div className="flex flex-col gap-2 px-2 mt-auto">
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
          settingsDialogOpen && "text-foreground bg-accent",
        )}
        onClick={() => setSettingsDialogOpen(true)}
        aria-label="Settings"
      >
        <Settings2 size={20} />
      </Button>
    </div>
  );
};