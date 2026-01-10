// lib/editor-menu-schema.ts
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  ListRestart,
  List,
  ListOrdered,
  Quote,
  Link,
  Undo,
  Redo,
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

export const getMenuGroups = (
  editor: Editor,
  state: EditorState,
  actions: Actions,
) => {
  return [
    // Group 1: History
    [
      {
        icon: Undo,
        label: "Undo",
        shortcut: "⌘Z",
        action: () => editor.chain().focus().undo().run(),
        isDisabled: !state.canUndo,
      },
      {
        icon: Redo,
        label: "Redo",
        shortcut: "⌘⇧Z",
        action: () => editor.chain().focus().redo().run(),
        isDisabled: !state.canRedo,
      },
    ],

    // Group 2: Text Formatting
    [
      {
        icon: Bold,
        label: "Format",
        items: [
          {
            icon: Bold,
            label: "Bold",
            shortcut: "⌘B",
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: state.isBold,
          },
          {
            icon: Italic,
            label: "Italic",
            shortcut: "⌘I",
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: state.isItalic,
          },
          {
            icon: Underline,
            label: "Underline",
            shortcut: "⌘U",
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: state.isUnderline,
          },
          {
            icon: Strikethrough,
            label: "Strikethrough",
            shortcut: "⌘⇧X",
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: state.isStrike,
          },
          {
            icon: Highlighter,
            label: "Highlight",
            action: () => editor.chain().focus().toggleHighlight().run(),
            isActive: state.isHighlight,
          },
        ],
      },
    ],

    // Group 3: Lists & Blocks
    [
      {
        icon: List,
        label: "Blocks",
        items: [
          {
            icon: List,
            label: "Bullet List",
            shortcut: "⌘⇧8",
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: state.isBulletList,
          },
          {
            icon: ListOrdered,
            label: "Ordered List",
            shortcut: "⌘⇧7",
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: state.isOrderedList,
          },
          {
            icon: Quote,
            label: "Quote",
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: state.isBlockquote,
          },
        ],
      },
    ],

    // Group 4: Tables
    [
      {
        icon: Table,
        label: "Table",
        items: [
          {
            icon: Plus,
            label: "Insert Table",
            action: () =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
          },
          {
            icon: Columns,
            label: "Add Column After",
            action: () => editor.chain().focus().addColumnAfter().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Columns,
            label: "Add Column Before",
            action: () => editor.chain().focus().addColumnBefore().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Rows,
            label: "Add Row After",
            action: () => editor.chain().focus().addRowAfter().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Rows,
            label: "Add Row Before",
            action: () => editor.chain().focus().addRowBefore().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Row",
            action: () => editor.chain().focus().deleteRow().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Column",
            action: () => editor.chain().focus().deleteColumn().run(),
            isDisabled: !state.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Table",
            action: () => editor.chain().focus().deleteTable().run(),
            isDisabled: !state.isTable,
          },
        ],
      },
    ],

    // Group 5: Insert Objects & Links
    [
      {
        icon: SquarePlus,
        label: "Insert",
        items: [
          {
            icon: Braces,
            label: "Code Block",
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: state.isCodeBlock,
          },
          {
            icon: ImageIcon,
            label: "Image",
            action: actions.handlers.handleImageClick,
          },
          {
            icon: SeparatorHorizontal,
            label: "Separator",
            action: () => editor.chain().focus().setHorizontalRule().run(),
          },
          {
            icon: Link,
            label: state.isLink ? "Edit Link" : "Add Link",
            action: () => actions.dialogs.link.setOpen(true),
            isActive: state.isLink,
          },
          {
            icon: Link2Off,
            label: "Remove Link",
            action: () => editor.chain().focus().unsetLink().run(),
            isDisabled: !state.isLink,
          },
        ],
      },
    ],
    state.hasSelection
      ? [
          {
            icon: TextSelect,
            label: "AI Actions",
            items: [
              {
                icon: ArrowDownWideNarrow,
                label: "Summarize",
                action: () => {
                  actions.dialogs.ai.setAction("summarize");
                  actions.dialogs.ai.setOpen(true);
                },
                isDisabled: actions.isBusy && !state.hasSelection,
              },
              {
                icon: ListRestart,
                label: "Rephrase",
                action: () => {
                  actions.dialogs.ai.setAction("rephrase");
                  actions.dialogs.ai.setOpen(true);
                },
                isDisabled: actions.isBusy && !state.hasSelection,
              },
              {
                icon: List,
                label: "Convert to Bullets",
                action: () => {
                  actions.dialogs.ai.setAction("bullet");
                  actions.dialogs.ai.setOpen(true);
                },
                isDisabled: actions.isBusy && !state.hasSelection,
              },
              {
                icon: Rainbow,
                label: "Organize Content",
                action: () => {
                  actions.dialogs.ai.setAction("organize");
                  actions.dialogs.ai.setOpen(true);
                },
                isDisabled: actions.isBusy && !state.hasSelection,
              },
            ],
          },
        ]
      : null,
  ].filter(Boolean);
};
