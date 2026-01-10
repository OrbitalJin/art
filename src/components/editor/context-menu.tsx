import React, { useState, useEffect } from "react";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useImportImage } from "@/hooks/use-import-image";
import { cn } from "@/lib/utils";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LinkDialog } from "./link-dialog";

import {
  Bold,
  Italic,
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
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

interface SubMenuItem {
  icon: React.ElementType;
  label: string;
  items: MenuItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

interface Props {
  children: React.ReactNode;
  editor: Editor | null;
  className?: string;
}

export const EditorContextMenu: React.FC<Props> = ({
  editor,
  className,
  children,
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const updateContent = useNoteStore((state) => state.updateContent);
  const activeId = useNoteStore((state) => state.activeId);
  const { importImage } = useImportImage();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) {
        return {
          canUndo: false,
          canRedo: false,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isHighlight: false,
          isBulletList: false,
          isOrderedList: false,
          isBlockquote: false,
          isCodeBlock: false,
          isTable: false,
          isLink: false,
        };
      }
      return {
        hasSelection: !ctx.editor.state.selection.empty,
        canUndo: ctx.editor.can().undo(),
        canRedo: ctx.editor.can().redo(),
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isUnderline: ctx.editor.isActive("underline"),
        isStrike: ctx.editor.isActive("strike"),
        isHighlight: ctx.editor.isActive("highlight"),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isTable: ctx.editor.isActive("table"),
        isLink: ctx.editor.isActive("link"),
      };
    },
  });

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (activeId && editor) {
          updateContent(activeId, editor.getHTML(), true);
        }
      }
    };
    document.addEventListener("keydown", handleSave);
    return () => document.removeEventListener("keydown", handleSave);
  }, [activeId, editor, updateContent]);

  if (!editor) return <div className={className}>{children}</div>;

  const handleAddLink = (url: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setIsLinkDialogOpen(false);
  };

  const handleImageClick = async () => {
    const base64 = await importImage();
    if (base64) {
      editor.chain().focus().setImage({ src: base64 }).run();
    }
  };

  const menuGroups: (MenuItem | SubMenuItem)[][] = [
    [
      {
        icon: Undo,
        label: "Undo",
        shortcut: "⌘Z",
        action: () => editor.chain().focus().undo().run(),
        isDisabled: !editorState!.canUndo,
      },
      {
        icon: Redo,
        label: "Redo",
        shortcut: "⌘⇧Z",
        action: () => editor.chain().focus().redo().run(),
        isDisabled: !editorState!.canRedo,
      },
    ],
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
            isActive: editorState!.isBold,
          },
          {
            icon: Italic,
            label: "Italic",
            shortcut: "⌘I",
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editorState!.isItalic,
          },
          {
            icon: Underline,
            label: "Underline",
            shortcut: "⌘U",
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editorState!.isUnderline,
          },
          {
            icon: Strikethrough,
            label: "Strikethrough",
            shortcut: "⌘⇧X",
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: editorState!.isStrike,
          },
          {
            icon: Highlighter,
            label: "Highlight",
            action: () => editor.chain().focus().toggleHighlight().run(),
            isActive: editorState!.isHighlight,
          },
        ],
      } as SubMenuItem,
    ],
    [
      {
        icon: List,
        label: "Lists",
        items: [
          {
            icon: List,
            label: "Bullet List",
            shortcut: "⌘⇧8",
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editorState!.isBulletList,
          },
          {
            icon: ListOrdered,
            label: "Ordered List",
            shortcut: "⌘⇧7",
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editorState!.isOrderedList,
          },
          {
            icon: Quote,
            label: "Quote",
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editorState!.isBlockquote,
          },
        ],
      } as SubMenuItem,
    ],
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
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Columns,
            label: "Add Column Before",
            action: () => editor.chain().focus().addColumnBefore().run(),
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Rows,
            label: "Add Row After",
            action: () => editor.chain().focus().addRowAfter().run(),
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Rows,
            label: "Add Row Before",
            action: () => editor.chain().focus().addRowBefore().run(),
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Row",
            action: () => editor.chain().focus().deleteRow().run(),
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Column",
            action: () => editor.chain().focus().deleteColumn().run(),
            isDisabled: !editorState!.isTable,
          },
          {
            icon: Trash2,
            label: "Delete Table",
            action: () => editor.chain().focus().deleteTable().run(),
            isDisabled: !editorState!.isTable,
          },
        ],
      } as SubMenuItem,
    ],
    [
      {
        icon: SquarePlus,
        label: "Insert",
        items: [
          {
            icon: Braces,
            label: "Code Block",
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editorState!.isCodeBlock,
          },
          {
            icon: ImageIcon,
            label: "Image",
            action: handleImageClick,
          },
          {
            icon: SeparatorHorizontal,
            label: "Separator",
            action: () => editor.chain().focus().setHorizontalRule().run(),
          },
          {
            icon: Link,
            label: editorState!.isLink ? "Edit Link" : "Add Link",
            action: () => setIsLinkDialogOpen(true),
            isActive: editorState!.isLink,
          },
          {
            icon: Link2Off,
            label: "Remove Link",
            action: () => editor.chain().focus().unsetLink().run(),
            isDisabled: !editorState!.isLink,
          },
        ],
      } as SubMenuItem,
    ],
  ];

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className={className}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {menuGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.map((item) => {
                if ("items" in item) {
                  return (
                    <ContextMenuSub key={item.label}>
                      <ContextMenuSubTrigger
                        disabled={item.isDisabled}
                        className={cn(
                          item.isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        {item.items.map((subItem) => (
                          <ContextMenuItem
                            key={subItem.label}
                            onClick={subItem.action}
                            disabled={subItem.isDisabled}
                            className={cn(
                              subItem.isActive &&
                                "bg-accent text-accent-foreground",
                            )}
                          >
                            <subItem.icon className="mr-2 h-4 w-4" />
                            <span>{subItem.label}</span>
                            {subItem.shortcut && (
                              <ContextMenuShortcut>
                                {subItem.shortcut}
                              </ContextMenuShortcut>
                            )}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  );
                } else {
                  return (
                    <ContextMenuItem
                      key={item.label}
                      onClick={item.action}
                      disabled={item.isDisabled}
                      className={cn(
                        item.isActive && "bg-accent text-accent-foreground",
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <ContextMenuShortcut>
                          {item.shortcut}
                        </ContextMenuShortcut>
                      )}
                    </ContextMenuItem>
                  );
                }
              })}
            </React.Fragment>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onAddLink={handleAddLink}
      />
    </>
  );
};
