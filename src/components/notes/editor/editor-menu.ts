import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  ListRestart,
  List,
  ListOrdered,
  Quote,
  Link,
  Braces,
  Strikethrough,
  Underline,
  Image as ImageIcon,
  Highlighter,
  Link2Off,
  Table,
  Columns,
  Rows,
  Plus,
  Trash2,
  SeparatorHorizontal,
  SquarePlus,
  ArrowDownWideNarrow,
  TextSelect,
  Rainbow,
} from "lucide-react";
import type { Actions, EditorState } from "@/lib/types";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  items?: MenuItem[];
}

interface MenuGroup {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: MenuItem[];
  action: () => void;
}

type MenuItemConfig = {
  icon: React.ComponentType<{ className?: string }>;
  label: string | ((state: EditorState) => string);
  shortcut?: string;
  isActive?: (state: EditorState) => boolean;
  isDisabled?: (state: EditorState, actions: Actions) => boolean;
  action: (editor: Editor, state: EditorState, actions: Actions) => void;
};

const FORMATTING_ITEMS: MenuItemConfig[] = [
  {
    icon: Bold,
    label: "Bold",
    shortcut: "⌘B",
    isActive: (state) => state.isBold,
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    icon: Italic,
    label: "Italic",
    shortcut: "⌘I",
    isActive: (state) => state.isItalic,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    icon: Underline,
    label: "Underline",
    shortcut: "⌘U",
    isActive: (state) => state.isUnderline,
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    shortcut: "⌘⇧X",
    isActive: (state) => state.isStrike,
    action: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    icon: Highlighter,
    label: "Highlight",
    isActive: (state) => state.isHighlight,
    action: (editor) => editor.chain().focus().toggleHighlight().run(),
  },
];

const LIST_ITEMS: MenuItemConfig[] = [
  {
    icon: List,
    label: "Bullet List",
    shortcut: "⌘⇧8",
    isActive: (state) => state.isBulletList,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    icon: ListOrdered,
    label: "Ordered List",
    shortcut: "⌘⇧7",
    isActive: (state) => state.isOrderedList,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: Quote,
    label: "Quote",
    isActive: (state) => state.isBlockquote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

const TABLE_ITEMS: MenuItemConfig[] = [
  {
    icon: Plus,
    label: "Insert Table",
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    icon: Columns,
    label: "Add Column After",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().addColumnAfter().run(),
  },
  {
    icon: Columns,
    label: "Add Column Before",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().addColumnBefore().run(),
  },
  {
    icon: Rows,
    label: "Add Row After",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().addRowAfter().run(),
  },
  {
    icon: Rows,
    label: "Add Row Before",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().addRowBefore().run(),
  },
  {
    icon: Trash2,
    label: "Delete Row",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().deleteRow().run(),
  },
  {
    icon: Trash2,
    label: "Delete Column",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().deleteColumn().run(),
  },
  {
    icon: Trash2,
    label: "Delete Table",
    isDisabled: (state) => !state.isTable,
    action: (editor) => editor.chain().focus().deleteTable().run(),
  },
];

const INSERT_ITEMS: MenuItemConfig[] = [
  {
    icon: Braces,
    label: "Code Block",
    isActive: (state) => state.isCodeBlock,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    icon: ImageIcon,
    label: "Image",
    action: (_, __, actions) => actions.handlers.handleImageClick,
  },
  {
    icon: SeparatorHorizontal,
    label: "Separator",
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    icon: Link,
    label: (state) => (state.isLink ? "Edit Link" : "Add Link"),
    isActive: (state) => state.isLink,
    action: (_, __, actions) => actions.dialogs.link.setOpen(true),
  },
  {
    icon: Link2Off,
    label: "Remove Link",
    isDisabled: (state) => !state.isLink,
    action: (editor) => editor.chain().focus().unsetLink().run(),
  },
];

const ACTION_ITEMS: MenuItemConfig[] = [
  {
    icon: ArrowDownWideNarrow,
    label: "Summarize",
    isDisabled: (state, actions) => !state.hasSelection || actions.isBusy,
    action: (_, __, actions) => {
      actions.dialogs.llm.setAction("summarize");
      actions.dialogs.llm.setOpen(true);
    },
  },
  {
    icon: ListRestart,
    label: "Rephrase",
    isDisabled: (state, actions) => !state.hasSelection || actions.isBusy,
    action: (_, __, actions) => {
      actions.dialogs.llm.setAction("rephrase");
      actions.dialogs.llm.setOpen(true);
    },
  },
  {
    icon: List,
    label: "Convert to Bullets",
    isDisabled: (state, actions) => !state.hasSelection || actions.isBusy,
    action: (_, __, actions) => {
      actions.dialogs.llm.setAction("bullet");
      actions.dialogs.llm.setOpen(true);
    },
  },
  {
    icon: Rainbow,
    label: "Organize Content",
    isDisabled: (state, actions) => !state.hasSelection || actions.isBusy,
    action: (_, __, actions) => {
      actions.dialogs.llm.setAction("organize");
      actions.dialogs.llm.setOpen(true);
    },
  },
];

// Helper functions
const createMenuItem = (
  config: MenuItemConfig,
  editor: Editor,
  state: EditorState,
  actions: Actions,
): MenuItem => {
  const { label, isActive, isDisabled } = config;

  return {
    icon: config.icon,
    label: typeof label === "function" ? label(state) : label,
    shortcut: config.shortcut,
    action: () => config.action(editor, state, actions),
    isActive: isActive ? isActive(state) : false,
    isDisabled: isDisabled ? isDisabled(state, actions) : false,
  };
};

const createMenuGroup = (
  label: string,
  icon: React.ComponentType,
  items: MenuItemConfig[],
  editor: Editor,
  state: EditorState,
  actions: Actions,
): MenuGroup => ({
  icon,
  label,
  action: () => {},
  items: items.map((config) => createMenuItem(config, editor, state, actions)),
});

export const getMenuGroups = (
  editor: Editor,
  state: EditorState,
  actions: Actions,
): MenuGroup[][] => {
  const groups = [
    createMenuGroup("Format", Bold, FORMATTING_ITEMS, editor, state, actions),
    createMenuGroup("Blocks", List, LIST_ITEMS, editor, state, actions),
    createMenuGroup("Table", Table, TABLE_ITEMS, editor, state, actions),
    createMenuGroup("Insert", SquarePlus, INSERT_ITEMS, editor, state, actions),
  ];

  const actionsGroup = createMenuGroup(
    "Actions",
    TextSelect,
    ACTION_ITEMS,
    editor,
    state,
    actions,
  );
  groups.push(actionsGroup);

  return groups.map((group) => [group]);
};
