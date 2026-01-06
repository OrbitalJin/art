import "@/styles/tiptap.css";
import {
  useEditor,
  EditorContent,
  useEditorState,
  Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { EditorToolbar } from "@/components/editor/toolbar";
import { ListKit } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { cn, formatDate } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store/use-note-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EditorStateObject {
  editor: Editor;
  wordCount: number;
  characterCount: number;
  canUndo: boolean;
  canRedo: boolean;
  isEditable: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isUnderline: boolean;
  isHighlight: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  isCode: boolean;
  isLink: boolean;
  content: string;
  toolbarActive: boolean;
}

export const Notes = () => {
  const [selectActive, setSelectActive] = useState(false);
  const activeId = useNoteStore((state) => state.activeId);
  const note = useNoteStore((state) => state.getFn(activeId ?? ""));

  const editor = useEditor({
    immediatelyRender: true,
    onSelectionUpdate: (e) => {
      const { from, to } = e.editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setSelectActive(text.trim().length > 0);
    },
    extensions: [
      StarterKit,
      TableKit,
      ListKit,
      Highlight,
      HorizontalRule,
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
  });

  const editorState = useEditorState({
    editor: editor,
    selector: (ctx) => {
      return {
        editor: ctx.editor,
        wordCount: ctx.editor.storage.characterCount.words(),
        characterCount: ctx.editor.storage.characterCount.characters(),
        canUndo: ctx.editor.can().undo(),
        canRedo: ctx.editor.can().redo(),
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isStrike: ctx.editor.isActive("strike"),
        isUnderline: ctx.editor.isActive("underline"),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isCode: ctx.editor.isActive("code"),
        isLink: ctx.editor.isActive("link"),
        isHighlight: ctx.editor.isActive("highlight"),
        isEditable: ctx.editor.isEditable,
        toolbarActive: selectActive,
        content: ctx.editor.getHTML(),
      };
    },
  });

  useEffect(() => {
    if (editor && note?.content !== undefined) {
      editor.commands.setContent(note.content);
    }
  }, [activeId, note?.content, editor]);

  return (
    <div className="flex-1 flex flex-row p-2 gap-2">
      <Sidebar />
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        <EditorToolbar
          state={editorState}
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 z-20",
            "flex backdrop-blur-md  mx-auto",
            "scale-95 opacity-50 backdrop-blur-md",
            "transition-all hover:scale-100 hover:opacity-100",
            "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            editorState.toolbarActive && "scale-100 opacity-100",
          )}
        />
        <EditorContent
          editor={editor}
          className={cn(
            "w-full h-full overflow-y-scroll max-w-3xl",
            "justify-center mx-auto p-2 pt-16",
          )}
        />

        <div className="absolute bottom-0 right-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mix-blend-difference">
            <span>{editorState.wordCount} words</span>
            <span>•</span>
            <span>{editorState.characterCount} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const setActive = useNoteStore((state) => state.setActive);
  const activeId = useNoteStore((state) => state.activeId);
  const create = useNoteStore((state) => state.create);

  const entries = useNoteStore((state) =>
    state.entries.sort((a, b) => b.updatedAt - a.updatedAt),
  );

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(true)}
            className={cn(
              "bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
              open && "opacity-0 pointer-events-none scale-90",
            )}
          >
            <PanelLeftOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Alt + S</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col h-full w-[380px] overflow-hidden",
        "transition-all rounded-xl border bg-card/50",
        "hover:border-primary/40",
        open ? "" : "w-0 border-0",
      )}
    >
      <div className="flex flex-row p-2 gap-2 border-b">
        <Button variant="outline" className="flex-1" onClick={() => create()}>
          <Plus></Plus>
          New Entry
        </Button>
        <Button size="icon" variant="outline" onClick={() => setOpen(false)}>
          <PanelLeftClose />
        </Button>
      </div>
      <div className="flex p-2 border-b">
        <div
          className={cn(
            "flex-1 flex flex-row p-2 gap-2 items-center",
            "bg-card border text-foreground/70 text-sm rounded-md",
          )}
        >
          <Search size={16} />
          <input
            className="outline-none flex-1"
            placeholder="Search entries..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 overflow-y-scroll">
        {entries.map((entry, index) => (
          <div
            key={index}
            onClick={() => {
              setActive(entry.id);
            }}
            className={cn(
              "flex flex-col p-2 gap-2",
              "transition-colors hover:bg-accent hover:border-l hover:border-primary rounded-md",
              activeId === entry.id && "bg-accent border-l border-primary",
            )}
          >
            <p className="text-sm ">{entry.title}</p>
            <p className="text-xs text-foreground/70">
              {formatDate(entry.updatedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
