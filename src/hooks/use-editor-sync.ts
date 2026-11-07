import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { savePageMarkdown } from "@/lib/store/journal/commands";
import { collectTags } from "@/lib/editor/extensions/tag";

const SAVE_DEBOUNCE_MS = 1500;

/**
 * Persists one editor instance's page. The instance belongs to a single page
 * (the editor is keyed by page id), so a save can never land on the wrong id.
 * Debounced on typing, flushed on unmount/page switch when there are pending
 * edits. The editor is not destroyed yet at cleanup: @tiptap/react defers
 * destruction by a tick.
 */
export const useEditorSync = (editor: Editor | null, pageId: string): void => {
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    let dirty = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const save = () => {
      if (editor.isDestroyed) return;
      // @ts-expect-error tiptap-markdown adds this at runtime
      const markdown: string = editor.storage.markdown.getMarkdown();
      savePageMarkdown(pageId, markdown, collectTags(editor.state.doc));
      dirty = false;
    };

    const onUpdate = () => {
      dirty = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, SAVE_DEBOUNCE_MS);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (timer) clearTimeout(timer);
      if (dirty) save();
    };
  }, [editor, pageId]);
};
