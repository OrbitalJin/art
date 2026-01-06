import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNoteStore } from "@/lib/store/use-note-store";
import { cn } from "@/lib/utils";
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
  PictureInPicture2,
  Highlighter,
  Pen,
  BookOpen,
  Save,
} from "lucide-react";

interface Props {
  state: EditorStateObject;
  className?: string;
}

export const EditorToolbar: React.FC<Props> = ({ state, className }) => {
  const updateContent = useNoteStore((state) => state.updateContet);
  const activeId = useNoteStore((state) => state.activeId);

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
      isActive: state.canUndo,
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => state.editor.chain().focus().redo().run(),
      isActive: state.canRedo,
    },
    { separator: true },
    {
      icon: Bold,
      label: "Bold",
      action: () => state.editor.chain().focus().toggleBold().run(),
      isActive: state.isBold,
    },

    {
      icon: Italic,
      label: "Italic",
      action: () => state.editor.chain().focus().toggleItalic().run(),
      isActive: state.isItalic,
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => state.editor.chain().focus().toggleStrike().run(),
      isActive: state.isStrike,
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => state.editor.chain().focus().toggleUnderline().run(),
      isActive: state.isUnderline,
    },
    {
      icon: Highlighter,
      label: "Highlight",
      action: () => state.editor.chain().focus().toggleHighlight().run(),
      isActive: state.isHighlight,
    },
    { separator: true },
    {
      icon: List,
      label: "Bullet List",
      action: () => state.editor.chain().focus().toggleBulletList().run(),
      isActive: state.isBulletList,
    },
    {
      icon: ListOrdered,
      label: "Ordered List",
      action: () => state.editor.chain().focus().toggleOrderedList().run(),
      isActive: state.isOrderedList,
    },
    { separator: true },
    {
      icon: Quote,
      label: "Quote",
      action: () => state.editor.chain().focus().toggleBlockquote().run(),
      isActive: state.isBlockquote,
    },
    {
      icon: Braces,
      label: "Code Block",
      action: () => state.editor.chain().focus().toggleCodeBlock().run(),
      isActive: state.isCodeBlock,
    },
    {
      icon: Code,
      label: "Code",
      action: () => state.editor.chain().focus().toggleCode().run(),
      isActive: state.isCode,
    },
    { separator: true },
    {
      icon: Link,
      label: "Link",
      action: addLink,
      isActive: state.isLink,
    },
    {
      icon: Image,
      label: "Image",
      action: () => {},
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

  const toggleEditable = () => {
    state.editor.setEditable(!state.editor.isEditable);
    state.editor.view.dispatch(state.editor.view.state.tr);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 rounded-md border bg-card/80 p-1 mx-auto",
        className,
      )}
    >
      {toolbarItems.map((item, index) => {
        if ("separator" in item) {
          return (
            <div key={`separator-${index}`} className="h-6 w-px border-l" />
          );
        }

        const { icon: Icon, label, action, isActive } = item;

        return (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={action}
                className="h-8 w-8"
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
            {!state.isEditable ? (
              <Pen className="h-4 w-4" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{!state.isEditable ? "Edit" : "Preview"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => activeId && updateContent(activeId, state.content)}
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Save</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
