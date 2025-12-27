import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  MessageCirclePlus,
  Palette,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useTheme } from "./providers/theme-provider";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export function CommandPalette() {
  const { createSession } = useSessionStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      shortcut: "Alt+1",
    },
    {
      path: "/chat",
      label: "Sessions",
      icon: MessageCircle,
      shortcut: "Alt+2",
    },
  ];

  const handleQuickChat = () => {
    createSession("Quick Session");
    handleNavigate("/chat");
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
    setOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.altKey && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (navigationItems[index]) {
          navigate(navigationItems[index].path);
          setOpen(false);
        }
      }

      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        handleThemeToggle();
      }

      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        handleQuickChat();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.path}
                value={item.label.toLowerCase()}
                onSelect={() => handleNavigate(item.path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem value="toggle theme" onSelect={handleThemeToggle}>
            <Palette className="mr-2 h-4 w-4" />
            Toggle Theme
            <CommandShortcut>Ctrl+T</CommandShortcut>
          </CommandItem>
          <CommandItem value="quick session" onSelect={handleQuickChat}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            Quick Session
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
