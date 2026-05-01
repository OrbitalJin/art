import { useEffect } from "react";
import { Editor } from "@tiptap/react";
import { useJournalStore } from "@/lib/store/use-journal-store";

export const useEditorSync = (
  editor: Editor | null,
  activeId: string | null,
) => {
  const note = useJournalStore((s) => s.getFn(activeId ?? ""));
  const updateContent = useJournalStore((s) => s.updateContent);

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
        updateContent(activeId, editor.storage.markdown.getMarkdown());
      }
    };
  }, [activeId, editor, updateContent]);
};
