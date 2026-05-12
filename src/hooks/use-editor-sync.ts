import { useEffect, useRef, useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { useJournalStore } from "@/lib/store/use-journal-store";

const SAVE_DEBOUNCE_MS = 1500;

export const useEditorSync = (
  editor: Editor | null,
  activeId: string | null,
) => {
  const note = useJournalStore((s) => s.getFn(activeId ?? ""));
  const updateContent = useJournalStore((s) => s.updateContent);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef(editor);
  const activeIdRef = useRef(activeId);
  editorRef.current = editor;
  activeIdRef.current = activeId;

  const doSave = useCallback(() => {
    const ed = editorRef.current;
    const id = activeIdRef.current;
    if (!ed || !id) return;
    setIsSaving(false);
    // @ts-expect-error tiptap-markdown adds this at runtime
    updateContent(id, ed.storage.markdown.getMarkdown());
  }, [updateContent]);

  // Sync editor content from store when note changes
  useEffect(() => {
    if (!editor || !activeId || !note) {
      editor?.commands.clearContent();
      return;
    }

    // @ts-expect-error tiptap-markdown adds this at runtime
    const currentMarkdown = editor.storage.markdown.getMarkdown();

    if (currentMarkdown === note.content) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    editor.commands.setContent(note.content);
  }, [activeId, editor, note]);

  // Debounced auto-save on editor updates
  useEffect(() => {
    if (!editor) return;

    const onUpdate = () => {
      if (!activeIdRef.current) return;
      setIsSaving(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doSave, SAVE_DEBOUNCE_MS);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, doSave]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (editor && activeId) {
        // @ts-expect-error tiptap-markdown adds this at runtime
        updateContent(activeId, editor.storage.markdown.getMarkdown());
      }
    };
  }, [activeId, editor, updateContent]);

  return { isSaving };
};
