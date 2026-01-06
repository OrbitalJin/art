import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCirclePlus, Palette } from "lucide-react";
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
import { useSessionStore } from "@/lib/store/use-session-store";
import type { NavigationItem } from "@/layout/sidebar";

interface Props {
  items: NavigationItem[];
}

export const CommandPalette: React.FC<Props> = ({ items }) => {
  const { create } = useSessionStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleQuickChat = () => {
    create("Quick Session");
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
        if (items[index]) {
          navigate(items[index].href);
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
          {items.map((item: NavigationItem) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={item.name.toLowerCase()}
                onSelect={() => handleNavigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.description}
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
};
