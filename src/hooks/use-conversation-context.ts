import { useMemo } from "react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { prompts } from "@/lib/ai/common/prompts";
import type { Entry } from "@/lib/store/notes/types";
import type { Session } from "@/lib/store/session/types";

export const useConversationContext = (session: Session | undefined) => {
  const getNote = useNoteStore((state) => state.getFn);

  return useMemo(() => {
    const contextNotes =
      session?.contextNotes
        .map(getNote)
        .filter((note): note is Entry => note !== undefined) || [];
    return prompts.format.notesAsContext(contextNotes);
  }, [session?.contextNotes, getNote]);
};