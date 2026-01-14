import { useEffect } from "react";
import { Editor } from "@tiptap/react";
import { useNoteStore } from "@/lib/store/use-note-store";

export const useEditorSync = (editor: Editor | null, activeId: string | null) => {
  const note = useNoteStore((s) => s.getFn(activeId ?? ""));
  const updateContent = useNoteStore((s) => s.updateContent);

  // Sync content with editor when note changes
  useEffect(() => {
    if (!editor || !activeId || !note) {
      editor?.commands.clearContent();
      return;
    }

    // @ts-expect-error tiptap-markdown adds this at runtime
    const currentMarkdown = editor.storage.markdown.getMarkdown();

    if (currentMarkdown === note.content) return;

    editor.commands.setContent(note.content);
  }, [activeId, editor, note]);

  // Save content on unmount
  useEffect(() => {
    return () => {
      if (editor && activeId) {
        // @ts-expect-error tiptap-markdown adds this at runtime
        updateContent(activeId, editor.storage.markdown.getMarkdown(), false);
      }
    };
  }, [activeId, editor, updateContent]);
};