import { Circle } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";

const appWindow = getCurrentWindow();

export const WindowControls = () => (
  <div className="flex flex-col gap-3 items-center">
    <div className="flex gap-1 px-2">
      <button
        onClick={() => appWindow.minimize()}
        className="group relative flex items-center justify-center"
      >
        <Circle
          className={cn(
            "h-3 w-3 fill-yellow-300/80 text-yellow-300/80",
            "transition-transform group-hover:scale-120",
          )}
        />
      </button>

      <button
        onClick={() => appWindow.toggleMaximize()}
        className="group relative flex items-center justify-center"
      >
        <Circle
          className={cn(
            "h-3 w-3 fill-green-300/80 text-green-300/80",
            "transition-transform group-hover:scale-120",
          )}
        />
      </button>

      <button
        onClick={() => appWindow.close()}
        className="group relative flex items-center justify-center"
      >
        <Circle
          className={cn(
            "h-3 w-3 fill-destructive text-destructive",
            "transition-transform group-hover:scale-120",
          )}
        />
      </button>
    </div>

    <div
      aria-hidden
      data-tauri-drag-region
      className="flex flex-col gap-1 w-full p-4"
    >
      <div className="h-px flex-1 border-t" />
      <div className="h-px flex-1 border-t" />
      <div className="h-px flex-1 border-t" />
    </div>
  </div>
);
