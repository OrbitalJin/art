import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  BookPlus,
  CheckSquare,
  Drama,
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

  const handleQuickChat = () => {
    const id = createSession("chat", "Quick Chat");
    handleNavigate(`/session/chat/${id}`);
  };

  const handleQuickAgent = () => {
    const id = createSession("agent", "Quick Agent");
    handleNavigate(`/session/agent/${id}`);
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

  useHotkey("Mod+K", () => setOpen((open) => !open));

  useHotkey(
    "Alt+1",
    () => {
      const item = items[0];
      if (item) handleNavigate(item.href);
    },
    { ignoreInputs: false },
  );

  useHotkey(
    "Alt+2",
    () => {
      const item = items[1];
      if (item) handleNavigate(item.href);
    },
    { ignoreInputs: false },
  );

  useHotkey(
    "Alt+3",
    () => {
      const item = items[2];
      if (item) handleNavigate(item.href);
    },
    { ignoreInputs: false },
  );

  useHotkey(
    "Alt+4",
    () => {
      const item = items[3];
      if (item) handleNavigate(item.href);
    },
    { ignoreInputs: false },
  );

  useHotkey("Mod+Alt+C", handleQuickChat);
  useHotkey("Mod+Alt+A", handleQuickAgent);
  useHotkey("Mod+Alt+N", handleQuickThought);
  useHotkey("Mod+Alt+T", handleQuickTask);
  useHotkey("Mod+,", handleOpenSettings);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem value="quick chat" onSelect={handleQuickChat}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            New Chat
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>C</Kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem value="quick agent" onSelect={handleQuickAgent}>
            <Drama className="mr-2 h-4 w-4" />
            New Agent
            <CommandShortcut className="flex flex-row items-center gap-1 scale-80">
              <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>A</Kbd>
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
            New Task
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
