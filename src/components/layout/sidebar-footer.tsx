import { SettingsDialog } from "../settings/settings-dialog";
import { UpdaterDialog } from "../updater-dialog";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Player } from "../interval/player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAudioPlayerActions } from "@/contexts/audio-player-context";
import { cn } from "@/lib/utils";

export const SidebarFooter = () => {
  const { playing } = useAudioPlayerActions();
  return (
    <div className="flex flex-col gap-2 px-2 mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Music className={cn(playing && "text-primary animate-pulse")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="left"
          className="w-auto border-none p-0 shadow-none bg-card/10 backdrop-blur-xl"
        >
          <Player variant="floating" />
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdaterDialog />
      <SettingsDialog />
    </div>
  );
};
