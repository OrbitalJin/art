import { useMemo } from "react";
import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Page } from "@/lib/store/journal/types";
import type { Session } from "@/lib/store/session/types";
import { format } from "@/lib/llm/prompts/format";

export const useSessionRefs = (session: Session | undefined) => {
  const getNote = useJournalStore((state) => state.getFn);
  return useMemo(() => {
    const contextNotes =
      session?.journalRefs
        .map(getNote)
        .filter((note): note is Page => note !== undefined) || [];
    return format.notesAsContext(contextNotes);
  }, [session?.journalRefs, getNote]);
};
