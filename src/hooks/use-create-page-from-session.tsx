import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCreatePageFromSession = () => {
  const updateNoteContent = useJournalStore((state) => state.updateContent);
  const currentWorkspace = useJournalStore((state) => state.currentWorkspace);
  const sessions = useSessionStore((state) => state.sessions);
  const createNote = useJournalStore((state) => state.create);
  const navigate = useNavigate();

  const { llm } = useLLM();

  const [creating, setCreating] = useState<boolean>(false);

  const create = async (sessionId: string) => {
    const toastId = toast.loading("Creating note from session...");
    setCreating(true);

    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        return toast.error("Session not found", { id: toastId });
      }

      const result = await llm?.genWithContext(
        gen.noteFromSession,
        session.messages,
      );

      if (!result) {
        return toast.error("Failed to generate note", { id: toastId });
      }

      const id = createNote(currentWorkspace, session.title + " - Notes");
      updateNoteContent(id, result, false);
      navigate("/journal");
      toast.success("Note created from session", { id: toastId });
    } catch (err) {
      console.error("Failed to create note from session", err);
      toast.error("Failed to create note from session", { id: toastId });
    } finally {
      setCreating(false);
      toast.dismiss(toastId);
    }
  };

  return {
    create,
    creating,
  };
};
