import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, CloudDownload, Music, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Player } from "@/components/interval/player";
import {
  SettingsDialog,
  type SettingsDialogTriggerState,
} from "@/components/settings/settings-dialog";
import {
  UpdaterDialog,
  type UpdaterDialogTriggerState,
} from "@/components/updater-dialog";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { Command } from "@/components/command";
import {
  useNavigation,
  type NavigationItem,
} from "@/components/layout/navigation";
import { WindowControls } from "@/components/layout/window-controls";
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

const renderSettingsTrigger = ({ open }: SettingsDialogTriggerState) => {
  const icon = <Settings strokeWidth={1.75} className="size-4 shrink-0" />;

  return <PanelRow active={open} label="Settings" icon={icon} />;
};

const renderUpdatesTrigger = ({
  open,
  updateAvailable,
}: UpdaterDialogTriggerState) => {
  const iconClassName = cn(
    "size-4 shrink-0",
    updateAvailable && "text-green-400",
  );
  const icon = <CloudDownload strokeWidth={1.75} className={iconClassName} />;
  const badge = updateAvailable ? <UpdateBadge /> : null;

  return (
    <PanelRow active={open} label="Updates" icon={icon} trailing={badge} />
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = items.find(isSelected);
  const CurrentIcon = current?.activeIcon;

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleEnter = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 120);
  };

  const handleLeave = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  const handlePanelEnter = () => {
    clearTimers();
  };

  const handleToggle = () => {
    clearTimers();
    setOpen((current) => !current);
  };

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const wrapperClassName = cn(
    "relative pointer-events-auto transition-opacity duration-200",
    "opacity-80 hover:opacity-100",
  );

  const pillClassName = cn(
    "flex items-center gap-1.5 rounded-full p-1",
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
    "absolute right-0 top-full mt-2 w-56 origin-top-right p-1.5",
    "rounded-2xl border border-border/40 bg-card/70 backdrop-blur-2xl",
    "shadow-xl shadow-black/15 ring-1 ring-inset ring-foreground/5",
    "transition-all duration-200 ease-out",
    open
      ? "visible translate-y-0 scale-100 opacity-100"
      : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0",
  );

  const headerClassName = cn(
    "px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      onPointerLeave={handleLeave}
    >
      <div data-tauri-drag-region className={pillClassName}>
        <button
          type="button"
          aria-label={open ? "Hide navigation" : "Show navigation"}
          aria-expanded={open}
          onClick={handleToggle}
          onPointerEnter={handleEnter}
          className={triggerClassName}
        >
          {CurrentIcon && (
            <CurrentIcon strokeWidth={1.75} className="size-3.5 text-primary" />
          )}
          {current && (
            <span className="text-xs font-medium text-foreground/90">
              {current.label}
            </span>
          )}
          <ChevronDown strokeWidth={2.25} className={chevronClassName} />
        </button>
        <MusicMenu className="size-6" />
        <div className="flex flex-row gap-1">
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
          <span aria-hidden className="h-3.5 w-px bg-border/60" />
        </div>
        <WindowControls />
      </div>

      <div
        aria-hidden={!open}
        className={panelClassName}
        onPointerEnter={handlePanelEnter}
      >
        <p className={headerClassName}>Navigate</p>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => (
            <ModeRow
              key={item.base}
              item={item}
              selected={isSelected(item)}
              onSelect={() => handleSelect(item.href)}
            />
          ))}
        </nav>

        <div aria-hidden className="mx-1 my-1.5 h-px bg-border/50" />

        <div className="flex flex-col gap-0.5">
          <UpdaterDialog trigger={renderUpdatesTrigger} />
          <SettingsDialog trigger={renderSettingsTrigger} />
        </div>
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
      <Command items={items} />
    </>
  );
};
