import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookPlus,
  CheckSquare,
  MessageCirclePlus,
  Settings2,
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
import { useSessionStore } from "@/lib/store/use-session-store";
import type { NavigationItem } from "@/components/layout/navigation";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { Kbd } from "./ui/kbd";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
interface Props {
  items: NavigationItem[];
}

export const Command: React.FC<Props> = ({ items }) => {
  const { create: createSession } = useSessionStore();
  const { create: createNote } = useJournalStore();
  const setSettingsDialogOpen = useUIStateStore(
    (state) => state.setSettingsDialogOpen,
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickSession = () => {
    createSession("Quick Session");
    handleNavigate("/chat");
  };

  const handleQuickThought = () => {
    createNote(undefined, "Quick Thought");
    handleNavigate("/journal");
  };

  const handleQuickTask = () => {
    handleNavigate("/tasks?create=true");
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

      if (e.altKey && e.key >= "1" && e.key <= "5") {
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
        handleQuickThought();
      }

      if (e.key === "t" && e.altKey && (e.ctrlKey || e.metaKey)) {
        handleQuickTask();
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
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem value="quick session" onSelect={handleQuickSession}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            Quick Session
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>S</Kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem value="quick thought" onSelect={handleQuickThought}>
            <BookPlus className="mr-2 h-4 w-4" />
            Quick Thought
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>N</Kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem value="quick task" onSelect={handleQuickTask}>
            <CheckSquare className="mr-2 h-3 w-3" />
            Quick Task
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>T</Kbd>
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {items.map((item: NavigationItem) => {
            const Icon = item.activeIcon;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => handleNavigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}

                <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
                  <Kbd>Alt</Kbd> +<Kbd>{item.shortcut}</Kbd>
                </CommandShortcut>
              </CommandItem>
            );
          })}

          <CommandItem value="settings" onSelect={handleOpenSettings}>
            <Settings2 className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd> +<Kbd>,</Kbd>
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
