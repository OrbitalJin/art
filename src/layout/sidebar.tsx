import { useLocation, useNavigate } from "react-router-dom";
import {
  Circle,
  LayoutDashboard,
  MessageCircle,
  Notebook,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { SettingsDialog } from "./settings-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/command-palette";

const appWindow = getCurrentWindow();

export interface NavigationItem {
  href: string;
  name: string;
  description: string;
  icon: LucideIcon;
  shortcut: string;
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();

  const handleToggleMaximize = async () => {
    await appWindow.toggleMaximize();
  };

  const handleCloseWindow = async () => {
    await appWindow.close();
  };

  const handleMinimizeWindow = async () => {
    await appWindow.minimize();
  };

  const isSelected = (path: string): boolean => {
    return location.pathname === path;
  };

  const items: NavigationItem[] = [
    {
      href: "/",
      name: "Dashboard",
      description: "Dashboard",
      icon: LayoutDashboard,
      shortcut: "Alt+1",
    },
    {
      href: "/chat",
      name: "Chat",
      description: "Chat",
      icon: MessageCircle,
      shortcut: "Alt+2",
    },

    {
      icon: Notebook,
      name: "Notes",
      description: "Notes",
      href: "/notes",
      shortcut: "Alt+3",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-2">
      <aside
        className={cn(
          "flex flex-col items-center w-[60px] h-full",
          "border rounded-lg bg-card/50 backdrop-blur-sm",
          "py-3 transition-all duration-300",
        )}
      >
        {/* Window controls */}
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-1 px-2">
            <button
              onClick={handleMinimizeWindow}
              className="group relative flex items-center justify-center"
            >
              <Circle
                className={cn(
                  "h-3 w-3 fill-yellow-500 text-yellow-500",
                  "transition-transform group-hover:scale-110",
                )}
              />
            </button>

            <button
              onClick={handleToggleMaximize}
              className="group relative flex items-center justify-center"
            >
              <Circle
                className={cn(
                  "h-3 w-3 fill-green-500 text-green-500",
                  "transition-transform group-hover:scale-110",
                )}
              />
            </button>

            <button
              onClick={handleCloseWindow}
              className="group relative flex items-center justify-center"
            >
              <Circle
                className={cn(
                  "h-3 w-3 fill-red-500 text-red-500",
                  "transition-transform group-hover:scale-110",
                )}
              />
            </button>
          </div>

          <div
            aria-hidden
            data-tauri-drag-region
            className="flex flex-col gap-1 w-full p-3"
          >
            <div className="h-px flex-1 border-t" />
            <div className="h-px flex-1 border-t" />
            <div className="h-px flex-1 border-t" />
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1 w-full px-2 items-center">
          {items.map((item, index) => (
            <Tooltip>
              <TooltipTrigger asChild key={`nav-${index}`}>
                <Button
                  className={cn(
                    "hover:scale-110",
                    isSelected(item.href) && "text-primary",
                  )}
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{item.description}</TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-2 mt-auto">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
              open && "text-foreground bg-accent",
            )}
            onClick={() => setOpen(true)}
            aria-label="Settings"
          >
            <Settings2 size={20} />
          </Button>

          <SettingsDialog open={open} onOpenChange={setOpen} />
        </div>
      </aside>
      <CommandPalette items={items} />
    </div>
  );
};
