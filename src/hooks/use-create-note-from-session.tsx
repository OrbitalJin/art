import { useLLM } from "@/contexts/llm-context";
import { prompts } from "@/lib/llm/common/prompts";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCreateNoteFromSession = () => {
  const updateNoteContent = useNoteStore((state) => state.updateContent);
  const currentWorkspace = useNoteStore((state) => state.currentWorkspace);
  const createNote = useNoteStore((state) => state.create);
  const sessions = useSessionStore((state) => state.sessions);
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
        prompts.gen.noteFromSession,
        session.messages,
      );

      if (!result) {
        return toast.error("Failed to generate note", { id: toastId });
      }

      const id = createNote(currentWorkspace, session.title + " - Notes");
      updateNoteContent(id, result, false);
      navigate("/notes");
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
