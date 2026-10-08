import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Player } from "@/components/interval/player";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { UpdaterDialog } from "@/components/updater-dialog";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { cn } from "@/lib/utils";

const MusicMenu = () => {
  const playing = useIntervalStore((state) => state.playing);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Music player"
          className="size-10 text-muted-foreground hover:text-foreground"
        >
          <Music className={cn(playing && "animate-pulse text-primary")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="left"
        className="w-auto border-none bg-card/10 p-0 shadow-none backdrop-blur-xl"
      >
        <Player variant="floating" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const SidebarFooter = () => (
  <div className="mt-auto flex flex-col gap-2 px-2">
    <MusicMenu />
    <UpdaterDialog />
    <SettingsDialog />
  </div>
);
