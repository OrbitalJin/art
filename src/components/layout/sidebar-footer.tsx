import { Settings2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { UpdaterDialog } from "../updater-dialog";

export const SidebarFooter = () => {
  const settingsOpen = useUIStateStore((state) => state.settingsDialogOpen);
  const setSettingsOpen = useUIStateStore(
    (state) => state.setSettingsDialogOpen,
  );
  const changelogOpen = useUIStateStore((state) => state.changelogDialogOpen);
  const setChangelogOpen = useUIStateStore(
    (state) => state.setChangelogDialogOpen,
  );

  return (
    <div className="flex flex-col gap-2 px-2 mt-auto">
      <UpdaterDialog />
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
          changelogOpen && "text-foreground bg-accent",
        )}
        onClick={() => setChangelogOpen(true)}
        aria-label="Changelog"
      >
        <History size={20} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
          settingsOpen && "text-foreground bg-accent",
        )}
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
      >
        <Settings2 size={20} />
      </Button>
    </div>
  );
};
