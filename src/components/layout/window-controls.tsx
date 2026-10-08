import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";

const appWindow = getCurrentWindow();

interface WindowButtonProps {
  label: string;
  color: string;
  onClick: () => void;
}

const WindowButton = ({ label, color, onClick }: WindowButtonProps) => (
  <button
    aria-label={label}
    onClick={onClick}
    className="group flex items-center justify-center"
  >
    <span
      className={cn(
        "size-3 rounded-full transition-transform group-hover:scale-125",
        color,
      )}
    />
  </button>
);

export const WindowControls = () => {
  const minimize = () => appWindow.minimize();
  const toggleMaximize = () => appWindow.toggleMaximize();
  const close = () => appWindow.close();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1 px-2">
        <WindowButton
          label="Minimize"
          color="bg-yellow-300/80"
          onClick={minimize}
        />
        <WindowButton
          label="Maximize"
          color="bg-green-300/80"
          onClick={toggleMaximize}
        />
        <WindowButton label="Close" color="bg-destructive" onClick={close} />
      </div>

      <div
        aria-hidden
        data-tauri-drag-region
        className="flex w-full flex-col gap-1 p-4"
      >
        <div className="pointer-events-none border-t" />
        <div className="pointer-events-none border-t" />
        <div className="pointer-events-none border-t" />
      </div>
    </div>
  );
};
