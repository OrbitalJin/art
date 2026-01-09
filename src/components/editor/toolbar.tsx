import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNoteStore } from "@/lib/store/use-note-store";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Undo,
  Redo,
  Braces,
  Strikethrough,
  Underline,
  Image as ImageIcon,
  PictureInPicture2,
  Highlighter,
  Pen,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useImportImage } from "@/hooks/use-import-image";
import { LinkDialog } from "@/components/editor/link-dialog";

interface Props {
  editor: Editor | null;
  className?: string;
}

export const EditorToolbar: React.FC<Props> = ({ editor, className }) => {
  const updateContent = useNoteStore((state) => state.updateContent);
  const activeId = useNoteStore((state) => state.activeId);
  const { importImage } = useImportImage();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  // Handle Ctrl+S Save
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

  if (!editor) {
    return null;
  }

  const handleImageClick = async () => {
    const base64 = await importImage();
    if (base64 && editor) {
      editor.chain().focus().setImage({ src: base64 }).run();
    }
  };

  const toggleEditable = () => {
    editor.setEditable(!editor.isEditable);
  };

  const handleAddLink = (url: string) => {
    if (editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setIsLinkDialogOpen(false);
  };

  const handleLinkButtonClick = () => {
    if (editor && !editor.state.selection.empty) {
      setIsLinkDialogOpen(true);
    }
  };

  const toolbarItems = [
    {
      icon: Undo,
      label: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isDisabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isDisabled: !editor.can().redo(),
    },
    { separator: true },
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      icon: Highlighter,
      label: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive("highlight"),
    },
    { separator: true },
    {
      icon: List,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    { separator: true },
    {
      icon: Quote,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: Braces,
      label: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    { separator: true },
    {
      icon: Link,
      label: "Link",
      action: handleLinkButtonClick,
      isActive: editor.isActive("link"),
      isDisabled: editor.state.selection.empty,
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: handleImageClick,
      isActive: false,
    },
    { separator: true },
    {
      icon: PictureInPicture2,
      label: "Pop out",
      action: () => {},
      isActive: false,
    },
  ];

  return (
    <>
      <LinkDialog
        onAddLink={handleAddLink}
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
      />
      <div
        className={cn(
          "flex items-center justify-center gap-1 rounded-md border bg-card/80 p-1 mx-auto",
          className,
        )}
        >
        {toolbarItems.map((item, index) => {
          if (item.separator) {
            return (
              <div key={`separator-${index}`} className="h-6 w-px border-l" />
            );
          }

          const { icon: Icon, label, action, isActive, isDisabled } = item;

          if (!Icon) return null;

          return (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={action}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8",
                    isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleEditable}>
              {!editor.isEditable ? (
                <Pen className="h-4 w-4" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{!editor.isEditable ? "Edit" : "Preview"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
