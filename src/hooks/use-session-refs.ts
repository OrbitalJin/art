import { useMemo } from "react";
import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Page } from "@/lib/store/journal/types";
import type { State as JournalState } from "@/lib/store/use-journal-store";
import type { Session } from "@/lib/store/session/types";
import { format } from "@/lib/llm/prompts/format";

export const getSessionRefsContext = (
  journalRefs: string[],
  journalStore: JournalState,
) => {
  const contextNotes =
    journalRefs
      .map((id) => journalStore.getFn(id))
      .filter((note): note is Page => note !== undefined) || [];
  return format.notesAsContext(contextNotes);
};

export const useSessionRefs = (session: Session | undefined) => {
  const getNote = useJournalStore((state) => state.getFn);
  return useMemo(() => {
    if (!session?.journalRefs.length) return "";
    return getSessionRefsContext(session.journalRefs, { getFn: getNote } as JournalState);
  }, [session?.journalRefs, getNote]);
};
