import { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useEditorState } from "@tiptap/react";
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
import { getMenuGroups } from "@/lib/schema/editor-menu";
import { useEditorActions } from "@/hooks/use-editor-actions";
import { cn } from "@/lib/utils";

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
  editor?: Editor;
}

export const Command: React.FC<Props> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "submenu">("main");
  const [submenuItems, setSubmenuItems] = useState<MenuItem[]>([]);
  const [submenuTitle, setSubmenuTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const actions = useEditorActions(editor || null);

  const editorState = useEditorState({
    editor: editor || null,
    selector: (ctx) => ({
      hasSelection: !ctx.editor?.state.selection.empty,
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isHighlight: ctx.editor?.isActive("highlight") ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
      isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
      isTable: ctx.editor?.isActive("table") ?? false,
      isLink: ctx.editor?.isActive("link") ?? false,
    }),
  });

  const menuGroups = useMemo(() => {
    if (!editor || !editorState) return [];
    return getMenuGroups(editor, editorState, actions);
  }, [editor, editorState, actions]);

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
        menuGroups.map((group, idx) => (
          <CommandGroup key={idx}>
            {group.map((item) => (
              <CommandItemRenderer
                key={item.label}
                item={item}
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
  );
};
