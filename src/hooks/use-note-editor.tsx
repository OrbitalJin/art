import { useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { ListKit } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useNoteStore } from "@/lib/store/use-note-store";
import { useDebounce } from "@/hooks/use-debounce";
import { extractTags } from "@/lib/utils/tags";
import { TagHighlighter } from "@/lib/extensions/tag-highlighter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useNoteEditor = () => {
  const activeId = useNoteStore((state) => state.activeId);
  const note = useNoteStore((state) => state.getFn(activeId ?? ""));
  const updateContent = useNoteStore((state) => state.updateContent);
  const updateTags = useNoteStore((state) => state.updateTags);
  const isDisabled = useNoteStore((state) => state.entries.length === 0);
  const [isSaving, setIsSaving] = useState(false);

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
          directions: ["bottom-right"],
          minWidth: 100,
          minHeight: 100,
          alwaysPreserveAspectRatio: true,
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
      handleClick: (_, __, event) => {
        const target = event.target as HTMLElement;
        const link = target.closest("a");

        if (link && link.href) {
          event.preventDefault();
          openUrl(link.href);
          toast.info("Opening link...");
          return true;
        }

        return false;
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

  const { wordCount, charCount } = useEditorState({
    editor,
    selector: (ctx) => ({
      wordCount: ctx.editor.storage.characterCount.words(),
      charCount: ctx.editor.storage.characterCount.characters(),
    }),
  });

  return {
    editor,
    wordCount,
    charCount,
    isSaving,
    isDisabled,
  };
};
