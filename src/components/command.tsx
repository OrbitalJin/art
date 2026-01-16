import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookPlus, MessageCirclePlus, Settings2 } from "lucide-react";
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
import { useSessionStore } from "@/lib/store/use-session-store";
import type { NavigationItem } from "@/components/layout/navigation";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";

interface Props {
  items: NavigationItem[];
}

export const Command: React.FC<Props> = ({ items }) => {
  const { create } = useSessionStore();
  const { create: createNote } = useNoteStore();
  const setSettingsDialogOpen = useSettingsStore(
    (state) => state.setSettingsDialogOpen,
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickSession = () => {
    create("Quick Session");
    handleNavigate("/chat");
  };

  const handleQuickNote = () => {
    createNote(undefined, "Quick Note");
    handleNavigate("/notes");
  };

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
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

      if (e.key === "s" && e.altKey && (e.ctrlKey || e.metaKey)) {
        handleQuickSession();
      }

      if (e.key === "n" && e.altKey && (e.ctrlKey || e.metaKey)) {
        handleQuickNote();
      }

      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenSettings();
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
            const Icon = item.activeIcon;
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

          <CommandItem value="settings" onSelect={handleOpenSettings}>
            <Settings2 className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut>Ctrl+,</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem value="quick session" onSelect={handleQuickSession}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            Quick Session
            <CommandShortcut>Ctrl+Alt+S</CommandShortcut>
          </CommandItem>

          <CommandItem value="quick note" onSelect={handleQuickNote}>
            <BookPlus className="mr-2 h-4 w-4" />
            Quick Note
            <CommandShortcut>Ctrl+Alt+N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
