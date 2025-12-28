import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Circle,
  LayoutDashboard,
  MessageCircle,
  Settings2,
} from "lucide-react";
import { SettingsDialog } from "./settings-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

const appWindow = getCurrentWindow();

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();

  const isSelected = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className="relative flex flex-row h-screen w-screen bg-background font-sans antialiased p-2 gap-2">
      <main
        className={cn(
          "flex-1 flex transition-all duration-300 border rounded-md",
        )}
      >
        {children}
      </main>
      <div className="flex flex-col h-full gap-2">
        <aside
          data-tauri-drag-region
          className={cn(
            "flex flex-col items-center w-[60px] h-full",
            "border rounded-lg bg-card/50 backdrop-blur-sm",
            "py-3 transition-all duration-300",
          )}
        >
          <div className="flex flex-col gap-4 items-center mb-4">
            <div className="flex gap-1 px-2">
              <button
                onClick={() => appWindow.close()}
                className="group relative flex items-center justify-center"
              >
                <Circle
                  className={cn(
                    "h-3 w-3 fill-red-500 text-red-500",
                    "transition-transform group-hover:scale-110",
                  )}
                />
              </button>
              <button
                onClick={() => appWindow.minimize()}
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
                onClick={() => appWindow.maximize()}
                className="group relative flex items-center justify-center"
              >
                <Circle
                  className={cn(
                    "h-3 w-3 fill-green-500 text-green-500",
                    "transition-transform group-hover:scale-110",
                  )}
                />
              </button>
            </div>

            <div className="w-8 h-px bg-border/50" />
          </div>

          <nav className="flex flex-col gap-2 flex-1 w-full px-2 items-center">
            <Button
              className={cn(
                "hover:scale-110",
                isSelected("/") && "text-primary",
              )}
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <LayoutDashboard size={20} />
            </Button>

            <Button
              className={cn(
                "hover:scale-110",
                isSelected("/chat") && "text-primary",
              )}
              size="icon"
              variant="ghost"
              onClick={() => navigate("/chat")}
              aria-label="Chat"
            >
              <MessageCircle size={20} />
            </Button>
          </nav>

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
      </div>
      <Toaster position="top-center" expand={false} />
      <CommandPalette />
    </div>
  );
}
