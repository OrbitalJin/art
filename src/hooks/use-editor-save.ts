import { useCallback, useEffect, useRef } from "react";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { extractTags } from "@/lib/utils/tags";

export const useEditorSave = (activeId: string | null) => {
  const updateContent = useJournalStore((s) => s.updateContent);
  const updateTags = useJournalStore((s) => s.updateTags);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setIsSavingRef = useRef<((saving: boolean) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSave = useCallback(
    (markdown: string, setIsSaving: (saving: boolean) => void) => {
      if (!activeId) return;

      setIsSaving(true);
      setIsSavingRef.current = setIsSaving;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (!activeId) return;

        const tags = extractTags(markdown);
        updateTags(activeId, tags);
        updateContent(activeId, markdown, false);

        if (setIsSavingRef.current) {
          setIsSavingRef.current(false);
        }
      }, 1000);
    },
    [activeId, updateContent, updateTags],
  );

  return { handleSave };
};
