import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, CloudDownload, Music, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Player } from "@/components/interval/player";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { UpdaterDialog } from "@/components/updater-dialog";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { Command } from "@/components/command";
import {
  useNavigation,
  type NavigationItem,
} from "@/components/layout/navigation";
import { WindowControls } from "@/components/layout/window-controls";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { PanelRow } from "./panel-row";

const iconButtonClassName = cn(
  "flex items-center justify-center rounded-full",
  "text-muted-foreground transition-colors",
  "hover:bg-accent/60 hover:text-foreground",
);

const MusicMenu = ({ className }: { className?: string }) => {
  const playing = useIntervalStore((state) => state.playing);

  if (!playing) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Music player"
          className={cn(iconButtonClassName, className)}
        >
          <Music
            strokeWidth={1.75}
            className="size-3.5 animate-pulse text-primary"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-auto border-none bg-card/10 p-0 shadow-none backdrop-blur-xl"
      >
        <Player variant="floating" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UpdateBadge = () => {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-green-400/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-green-400" />
      </span>
      New
    </span>
  );
};

interface MenuRowProps {
  onOpen: () => void;
}

const SettingsMenuItem = ({ onOpen }: MenuRowProps) => {
  const open = useUIStateStore((state) => state.settingsDialogOpen);
  const setOpen = useUIStateStore((state) => state.setSettingsDialogOpen);

  return (
    <PanelRow
      onClick={() => {
        setOpen(true);
        onOpen();
      }}
      active={open}
      label="Settings"
      icon={<Settings strokeWidth={1.75} className="size-4 shrink-0" />}
    />
  );
};

const UpdatesMenuItem = ({ onOpen }: MenuRowProps) => {
  const open = useUIStateStore((state) => state.updateDialogOpen);
  const setOpen = useUIStateStore((state) => state.setUpdateDialogOpen);
  const updateAvailable = useUIStateStore((state) => state.updateAvailable);

  const iconClassName = cn(
    "size-4 shrink-0",
    updateAvailable && "text-green-400",
  );

  return (
    <PanelRow
      onClick={() => {
        setOpen(true);
        onOpen();
      }}
      active={open}
      label="Updates"
      icon={<CloudDownload strokeWidth={1.75} className={iconClassName} />}
      trailing={updateAvailable ? <UpdateBadge /> : null}
    />
  );
};

interface ModeRowProps {
  item: NavigationItem;
  selected: boolean;
  onSelect: () => void;
}

const ModeRow = ({ item, selected, onSelect }: ModeRowProps) => {
  const Icon = selected ? item.activeIcon : item.icon;

  const iconClassName = cn("size-4 shrink-0", selected && "text-primary");

  const hintClassName = cn(
    "rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5",
    "text-[10px] font-medium tabular-nums text-muted-foreground/70",
    "transition-opacity",
    selected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
  );

  return (
    <PanelRow
      onClick={onSelect}
      aria-current={selected ? "page" : undefined}
      active={selected}
      label={item.label}
      icon={<Icon strokeWidth={1.75} className={iconClassName} />}
      trailing={<kbd className={hintClassName}>Alt {item.shortcut}</kbd>}
    />
  );
};

interface ClusterProps {
  items: NavigationItem[];
  isSelected: (item: NavigationItem) => boolean;
}

const Cluster = ({ items, isSelected }: ClusterProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorOffset, setAnchorOffset] = useState({ side: 8, align: 0 });

  const current = items.find(isSelected);
  const CurrentIcon = current?.activeIcon;

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  // Radix anchors the panel to the trigger button, but the panel used to hang
  // off the whole pill. Re-anchor it to the pill on open by measuring the
  // difference between the pill and the trigger.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      const pill = pillRef.current;
      const trigger = triggerRef.current;
      if (pill && trigger) {
        const pillRect = pill.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        setAnchorOffset({
          side: 8 + (pillRect.bottom - triggerRect.bottom),
          align: triggerRect.right - pillRect.right,
        });
      }
    }
    setOpen(next);
  };

  const wrapperClassName = cn(
    "pointer-events-auto transition-opacity duration-200",
    "opacity-80 hover:opacity-100",
  );

  const pillClassName = cn(
    "flex items-center gap-1.5 rounded-full p-1.5",
    "border border-border",
    "backdrop-blur-xl shadow-lg shadow-black/10 transition-colors duration-200",
    open ? "bg-card/70" : "bg-card/40",
  );

  const triggerClassName = cn(
    "flex h-6 items-center gap-1.5 rounded-full pl-2 pr-1.5 outline-none",
    "text-muted-foreground transition-colors",
    "hover:bg-accent/60 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const chevronClassName = cn(
    "size-3 transition-transform duration-200",
    open && "rotate-180",
  );

  const panelClassName = cn(
    "w-56 origin-top-right rounded-2xl border border-border/40 bg-card/70 p-1.5",
    "backdrop-blur-2xl shadow-xl shadow-black/15 ring-1 ring-inset ring-foreground/5",
  );

  const headerClassName = cn(
    "px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  return (
    <div className={wrapperClassName}>
      <div ref={pillRef} data-tauri-drag-region className={pillClassName}>
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              aria-label={open ? "Hide navigation" : "Show navigation"}
              className={triggerClassName}
            >
              {CurrentIcon && (
                <CurrentIcon
                  strokeWidth={1.75}
                  className="size-3.5 text-primary"
                />
              )}
              {current && (
                <span className="text-xs font-medium text-foreground/90">
                  {current.label}
                </span>
              )}
              <ChevronDown strokeWidth={2.25} className={chevronClassName} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={anchorOffset.side}
            alignOffset={anchorOffset.align}
            className={panelClassName}
          >
            <DropdownMenuLabel className={headerClassName}>
              Navigate
            </DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              {items.map((item) => (
                <ModeRow
                  key={item.base}
                  item={item}
                  selected={isSelected(item)}
                  onSelect={() => handleSelect(item.href)}
                />
              ))}
            </div>

            <DropdownMenuSeparator className="mx-1 my-1.5 h-px bg-border/50" />

            <div className="flex flex-col gap-0.5">
              <UpdatesMenuItem onOpen={() => setOpen(false)} />
              <SettingsMenuItem onOpen={() => setOpen(false)} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <MusicMenu className="size-6" />
        <div className="flex flex-row gap-1 pointer-events-none">
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
        </div>
        <WindowControls />
      </div>
    </div>
  );
};

export const Chrome = () => {
  const { items, isSelected } = useNavigation();

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0.5 z-50 flex justify-end p-3">
        <Cluster items={items} isSelected={isSelected} />
      </div>
      <SettingsDialog />
      <UpdaterDialog />
      <Command items={items} />
    </>
  );
};
