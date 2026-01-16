import { useMemo } from "react";
import { useNoteStore } from "@/lib/store/use-note-store";
import type { Entry } from "@/lib/store/notes/types";
import type { Session } from "@/lib/store/session/types";
import { format } from "@/lib/llm/prompts/format";

export const useSessionRefs = (session: Session | undefined) => {
  const getNote = useNoteStore((state) => state.getFn);
  return useMemo(() => {
    const contextNotes =
      session?.noteRefs
        .map(getNote)
        .filter((note): note is Entry => note !== undefined) || [];
    return format.notesAsContext(contextNotes);
  }, [session?.noteRefs, getNote]);
};
