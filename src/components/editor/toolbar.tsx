import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EditorStateObject } from "@/pages/notes";
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
  Image,
} from "lucide-react";

interface EditorToolbarProps {
  state: EditorStateObject;
}

export function EditorToolbar({ state }: EditorToolbarProps) {
  if (!state) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      state.editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const toolbarItems = [
    {
      icon: Undo,
      label: "Undo",
      action: () => state.editor.chain().focus().undo().run(),
      isActive: () => state.editor.can().undo(),
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => state.editor.chain().focus().redo().run(),
      isActive: () => state.editor.can().redo(),
    },
    { separator: true },
    {
      icon: Bold,
      label: "Bold",
      action: () => state.editor.chain().focus().toggleBold().run(),
      isActive: () => state.editor.isActive("bold"),
    },

    {
      icon: Italic,
      label: "Italic",
      action: () => state.editor.chain().focus().toggleItalic().run(),
      isActive: () => state.editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => state.editor.chain().focus().toggleStrike().run(),
      isActive: () => state.editor.isActive("strike"),
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => state.editor.chain().focus().toggleUnderline().run(),
      isActive: () => state.editor.isActive("underline"),
    },
    { separator: true },
    {
      icon: List,
      label: "Bullet List",
      action: () => state.editor.chain().focus().toggleBulletList().run(),
      isActive: () => state.editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Ordered List",
      action: () => state.editor.chain().focus().toggleOrderedList().run(),
      isActive: () => state.editor.isActive("orderedList"),
    },
    { separator: true },
    {
      icon: Quote,
      label: "Quote",
      action: () => state.editor.chain().focus().toggleBlockquote().run(),
      isActive: () => state.editor.isActive("blockquote"),
    },
    {
      icon: Braces,
      label: "Code Block",
      action: () => state.editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => state.editor.isActive("codeBlock"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => state.editor.chain().focus().toggleCode().run(),
      isActive: () => state.editor.isActive("code"),
    },
    { separator: true },
    {
      icon: Link,
      label: "Link",
      action: addLink,
      isActive: () => state.editor.isActive("link"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => {},
      isActive: () => false,
    },
  ];

  return (
    <div className="flex items-center justify-center gap-1 rounded-md border bg-card/80 p-1 mx-auto">
      {toolbarItems.map((item, index) => {
        if ("separator" in item) {
          return (
            <Separator
              key={`separator-${index}`}
              orientation="vertical"
              className="h-8"
            />
          );
        }

        const { icon: Icon, label, action, isActive } = item;

        return (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive() ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={action}
                className="h-8 w-8"
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
