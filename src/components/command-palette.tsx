import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  StickyNote,
  Calendar,
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

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
      shortcut: "Alt+1",
    },
    {
      path: "/chat",
      label: "Chat AI",
      icon: MessageSquare,
      shortcut: "Alt+2",
    },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to toggle command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Alt+number shortcuts for direct navigation
      if (e.altKey && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (navigationItems[index]) {
          navigate(navigationItems[index].path);
          setOpen(false);
        }
      }

      // Ctrl+T for theme toggle
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const themeButton = document.querySelector(
          '[data-testid="theme-toggle"]',
        );
        if (themeButton && themeButton instanceof HTMLElement) {
          themeButton.click();
        }
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

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
          <CommandItem
            value="toggle theme"
            onSelect={() => {
              setTheme(theme === "light" ? "dark" : "light");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4" />
            Toggle Theme
            <CommandShortcut>Ctrl+T</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
