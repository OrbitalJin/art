import { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { Editor } from "@tiptap/react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { getMenuGroups } from "@/components/notes/editor/editor-menu";
import { useEditorActions } from "@/hooks/use-editor-actions";
import { cn } from "@/lib/utils";
import { useEditorStateSelector } from "@/hooks/use-editor-state-selector";
import { TextActionDialog } from "@/components/notes/editor/context-menu/text-action-dialog";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: () => void;
  isDisabled?: boolean;
  isActive?: boolean;
  items?: MenuItem[];
}

const CommandItemRenderer = ({
  item,
  onNavigate,
  onClose,
}: {
  item: MenuItem;
  onNavigate?: (items: MenuItem[], title: string) => void;
  onClose?: () => void;
}) => {
  const Icon = item.icon;

  if (item.items) {
    return (
      <CommandItem
        value={item.label.toLowerCase()}
        onSelect={() => onNavigate?.(item.items!, item.label)}
        disabled={item.isDisabled}
        className={cn(item.isActive && "bg-accent")}
      >
        <Icon className="mr-2 h-4 w-4" />
        {item.label}
        <ChevronRight className="ml-auto h-4 w-4" />
      </CommandItem>
    );
  }

  return (
    <CommandItem
      value={item.label.toLowerCase()}
      onSelect={() => {
        item.action();
        onClose?.();
      }}
      disabled={item.isDisabled}
      className={cn(item.isActive && "bg-accent")}
    >
      <Icon className="mr-2 h-4 w-4" />
      {item.label}
      {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
    </CommandItem>
  );
};

interface Props {
  editor: Editor;
}

export const Command: React.FC<Props> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "submenu">("main");
  const [submenuItems, setSubmenuItems] = useState<MenuItem[]>([]);
  const [submenuTitle, setSubmenuTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const actions = useEditorActions(editor || null);
  const selector = useEditorStateSelector(editor);

  const menuGroups = useMemo(() => {
    if (!editor || !selector?.state) return [];
    return getMenuGroups(editor, selector.state, actions);
  }, [editor, selector, actions]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "o" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  const handleNavigateToSubmenu = (items: MenuItem[], title: string) => {
    setSubmenuItems(items);
    setSubmenuTitle(title);
    setCurrentView("submenu");
    setSearchQuery("");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSubmenuItems([]);
    setSubmenuTitle("");
    setSearchQuery("");
  };

  const renderMainView = () => (
    <>
      {editor &&
        menuGroups.map((groupArray, idx) => (
          <CommandGroup key={idx}>
            {groupArray.map((menuGroup) => (
              <CommandItemRenderer
                key={menuGroup.label}
                item={menuGroup}
                onNavigate={handleNavigateToSubmenu}
                onClose={() => setOpen(false)}
              />
            ))}
          </CommandGroup>
        ))}
    </>
  );

  const renderSubmenuView = () => (
    <>
      <CommandGroup heading={submenuTitle}>
        <CommandItem value="back" onSelect={handleBackToMain}>
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </CommandItem>
        {submenuItems.map((item) => (
          <CommandItemRenderer
            key={item.label}
            item={item}
            onClose={() => setOpen(false)}
          />
        ))}
      </CommandGroup>
    </>
  );

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
        <CommandInput
          placeholder="Type a command or search..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {currentView === "main" ? renderMainView() : renderSubmenuView()}
        </CommandList>
      </CommandDialog>

      <TextActionDialog
        isOpen={actions.dialogs.llm.open}
        onOpenChange={actions.dialogs.llm.setOpen}
        onProcess={actions.handlers.handleAiProcess}
        action={actions.dialogs.llm.action || "summarize"}
        isProcessing={actions.isBusy}
      />
    </>
  );
};
