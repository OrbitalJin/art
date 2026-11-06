import { useEffect, useRef, useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { tagPluginKey } from "@/lib/editor/extensions/tag-highlighter";

const SAVE_DEBOUNCE_MS = 1500;

export const useEditorSync = (
  editor: Editor | null,
  activeId: string | null,
) => {
  const updateContent = useJournalStore((s) => s.updateContent);
  const updateTags = useJournalStore((s) => s.updateTags);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef(editor);
  const activeIdRef = useRef(activeId);
  // The note whose content the editor currently holds; only a change here
  // should pull content back out of the store.
  const loadedIdRef = useRef<string | null>(null);
  editorRef.current = editor;
  activeIdRef.current = activeId;

  // Tags are derived from the document by the tag highlighter plugin, so read
  // them straight from its state instead of re-parsing the markdown output.
  const syncTags = useCallback(
    (ed: Editor, id: string) => {
      const tags = tagPluginKey.getState(ed.state)?.tags;
      if (tags) updateTags(id, tags);
    },
    [updateTags],
  );

  const doSave = useCallback(() => {
    const ed = editorRef.current;
    const id = activeIdRef.current;
    if (!ed || ed.isDestroyed || !id) return;
    setIsSaving(false);
    // @ts-expect-error tiptap-markdown adds this at runtime
    updateContent(id, ed.storage.markdown.getMarkdown());
    syncTags(ed, id);
  }, [updateContent, syncTags]);

  // Load store content into the editor when the active note changes.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    if (!activeId) {
      editor.commands.clearContent();
      loadedIdRef.current = null;
      return;
    }

    // Ignore plain note mutations: the store lags behind the editor until the
    // debounced save runs, so re-reading it here would clobber in-flight edits.
    if (loadedIdRef.current === activeId) return;

    const content = useJournalStore.getState().getFn(activeId)?.content ?? "";

    // @ts-expect-error tiptap-markdown adds this at runtime
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (currentMarkdown !== content) editor.commands.setContent(content);
    loadedIdRef.current = activeId;
    syncTags(editor, activeId);
  }, [activeId, editor, syncTags]);

  // Debounced auto-save on editor updates. Tags are cheap to read, so they are
  // synced immediately to keep the sidebar filter in step with typing.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const onUpdate = () => {
      const id = activeIdRef.current;
      if (!id) return;
      setIsSaving(true);
      syncTags(editor, id);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doSave, SAVE_DEBOUNCE_MS);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, doSave, syncTags]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (editor && !editor.isDestroyed && activeId) {
        // @ts-expect-error tiptap-markdown adds this at runtime
        updateContent(activeId, editor.storage.markdown.getMarkdown());
        syncTags(editor, activeId);
      }
    };
  }, [activeId, editor, updateContent, syncTags]);

  return { isSaving };
};
