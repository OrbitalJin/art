import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
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

const iconButtonClassName = cn(
  "flex items-center justify-center rounded-lg",
  "text-muted-foreground transition-colors",
  "hover:bg-accent/50 hover:text-foreground",
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
            className="size-4 animate-pulse text-primary"
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

interface ModeRowProps {
  item: NavigationItem;
  selected: boolean;
  onSelect: () => void;
}

const ModeRow = ({ item, selected, onSelect }: ModeRowProps) => {
  const Icon = selected ? item.activeIcon : item.icon;

  const rowClassName = cn(
    "group/row relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm",
    "text-muted-foreground transition-colors",
    "hover:bg-accent/50 hover:text-foreground",
    selected && "bg-accent/60 text-foreground",
  );

  const hintClassName = cn(
    "text-[10px] tabular-nums text-muted-foreground/50 transition-opacity",
    selected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "page" : undefined}
      className={rowClassName}
    >
      {selected && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
        />
      )}
      <Icon
        strokeWidth={1.75}
        className={cn("size-4 shrink-0", selected && "text-primary")}
      />
      <span className="flex-1 text-left">{item.label}</span>
      <span className={hintClassName}>Alt {item.shortcut}</span>
    </button>
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

  const handleToggle = () => {
    clearTimers();
    setOpen((current) => !current);
  };

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const pillClassName = cn(
    "flex items-center gap-2 rounded-full px-2.5 py-1.5",
    "border border-border/40 backdrop-blur-xl shadow-sm transition-colors",
    open ? "bg-card/70" : "bg-card/40",
  );

  const panelClassName = cn(
    "absolute right-0 top-full mt-1.5 w-52 origin-top-right p-1",
    "rounded-2xl border border-border/40 bg-card/70 shadow-lg backdrop-blur-2xl",
    "transition-all duration-200 ease-out",
    open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
  );

  return (
    <div
      ref={wrapperRef}
      className="relative pointer-events-auto transition-opacity opacity-70 hover:opacity-100"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div data-tauri-drag-region className={pillClassName}>
        <button
          type="button"
          aria-label={open ? "Hide navigation" : "Show navigation"}
          aria-expanded={open}
          onClick={handleToggle}
          className={cn(
            "flex size-5 items-center justify-center rounded-full",
            "text-muted-foreground transition-colors hover:text-foreground",
          )}
        >
          <ChevronDown
            strokeWidth={2.25}
            className={cn(
              "size-3.5 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
        <MusicMenu className="size-5" />
        <span aria-hidden className="h-4 w-px bg-border/60" />
        <WindowControls />
      </div>

      <div className={panelClassName}>
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

        <div aria-hidden className="my-1 h-px bg-border/50" />

        <div className="flex items-center justify-center gap-1">
          <UpdaterDialog />
          <SettingsDialog />
        </div>
      </div>
    </div>
  );
};

export const Chrome = () => {
  const { items, isSelected } = useNavigation();

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-end p-3">
        <Cluster items={items} isSelected={isSelected} />
      </div>
      <Command items={items} />
    </>
  );
};
