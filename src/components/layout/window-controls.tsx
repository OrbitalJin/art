import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Plus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const appWindow = getCurrentWindow();

interface WindowButtonProps {
  label: string;
  icon: LucideIcon;
  dotColor: string;
  onClick: () => void;
}

const WindowButton = ({
  label,
  icon: Icon,
  dotColor,
  onClick,
}: WindowButtonProps) => {
  const buttonClassName = cn(
    "flex items-center justify-center rounded-full p-1",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const dotClassName = cn(
    "flex size-3 items-center justify-center rounded-full",
    "bg-foreground/15 transition-colors duration-200",
    dotColor,
  );

  const glyphClassName = cn(
    "size-2 text-black/60 opacity-0",
    "transition-opacity duration-200",
    "group-hover/controls:opacity-100",
  );

  return (
    <button aria-label={label} onClick={onClick} className={buttonClassName}>
      <span className={dotClassName}>
        <Icon strokeWidth={3.5} className={glyphClassName} />
      </span>
    </button>
  );
};

export const WindowControls = () => {
  const minimize = () => appWindow.minimize();
  const toggleMaximize = () => appWindow.toggleMaximize();
  const close = () => appWindow.close();

  return (
    <div
      data-tauri-drag-region
      className="group/controls flex items-center pr-0.5"
    >
      <WindowButton
        label="Minimize"
        icon={Minus}
        dotColor="group-hover/controls:bg-amber-400"
        onClick={minimize}
      />
      <WindowButton
        label="Maximize"
        icon={Plus}
        dotColor="group-hover/controls:bg-emerald-400"
        onClick={toggleMaximize}
      />
      <WindowButton
        label="Close"
        icon={X}
        dotColor="group-hover/controls:bg-red-400"
        onClick={close}
      />
    </div>
  );
};
