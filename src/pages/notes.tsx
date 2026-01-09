import "@/styles/tiptap.css";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { EditorToolbar } from "@/components/editor/toolbar";
import { ListKit } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { StaticSidebar } from "@/components/notes/sidebar/static";
import { useDebounce } from "@/hooks/use-debounce";
import { extractTags } from "@/lib/utils/tags";
import { TagHighlighter } from "@/lib/extensions/tag-highlighter";

export const Notes = () => {
  const [isSaving, setIsSaving] = useState(false);

  const activeId = useNoteStore((state) => state.activeId);
  const note = useNoteStore((state) => state.getFn(activeId ?? ""));
  const updateContent = useNoteStore((state) => state.updateContent);
  const updateTags = useNoteStore((state) => state.updateTags);
  const isDisabled = useNoteStore((state) => state.entries.length === 0);

  const debouncedSave = useDebounce((content: string) => {
    if (activeId) {
      const tags = extractTags(content);
      updateTags(activeId, tags);
      updateContent(activeId, content, false);
      setIsSaving(false);
    }
  }, 1000);

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit,
      TableKit,
      ListKit,
      Highlight,
      HorizontalRule,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
        resize: {
          enabled: true,
        },
      }),
      TagHighlighter,
      Markdown.configure({ html: true, transformPastedText: true }),
      CharacterCount.configure({ limit: 50000 }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none",
      },
      handlePaste: (view, event) => {
        if (!event.clipboardData) return false;

        const items = Array.from(event.clipboardData.items);
        const hasImage = items.some((item) => item.type.startsWith("image/"));

        if (!hasImage) return false;

        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src: base64 });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
        };
        reader.readAsDataURL(file);

        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false;

        const files = Array.from(event.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (!imageFile) return false;

        event.preventDefault();

        const { schema } = view.state;
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const base64 = e.target?.result as string;
            const node = schema.nodes.image.create({ src: base64 });
            if (coordinates) {
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            } else {
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            }
          } catch (error) {
            console.error("Failed to handle image drop:", error);
          }
        };
        reader.onerror = () => {
          console.error("Failed to read dropped image file");
        };
        reader.readAsDataURL(imageFile);

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      debouncedSave(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !activeId || !note) return;
    const currentContent = editor.getHTML();
    if (currentContent !== note.content) {
      editor.commands.setContent(note.content);
    }
  }, [activeId, editor, note]);

  useEffect(() => {
    return () => {
      if (editor && activeId) {
        updateContent(activeId, editor.getHTML(), false);
      }
    };
  }, [activeId, editor, updateContent]);

  const { wordCount, charCount, isSelectionActive } = useEditorState({
    editor,
    selector: (ctx) => ({
      wordCount: ctx.editor.storage.characterCount.words(),
      charCount: ctx.editor.storage.characterCount.characters(),
      isSelectionActive: !ctx.editor.state.selection.empty,
    }),
  });

  if (!editor) return null;

  return (
    <div className="flex-1 flex flex-row p-2 gap-2">
      <StaticSidebar />
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden",
          isDisabled && "pointer-events-none opacity-80",
        )}
      >
        <EditorToolbar
          editor={editor}
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 z-20",
            "flex backdrop-blur-md mx-auto",
            "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "scale-95 opacity-50 hover:scale-100 hover:opacity-100",
            isSelectionActive && "scale-100 opacity-100",
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
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>

            {isSaving && (
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
