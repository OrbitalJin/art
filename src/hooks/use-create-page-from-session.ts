import { useSessionStore } from "@/lib/store/use-session-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCreatePageFromSession = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const navigate = useNavigate();

  const [creating, setCreating] = useState<boolean>(false);

  const create = async (sessionId: string) => {
    const toastId = toast.loading("Creating note from session...");
    setCreating(true);

    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        return toast.error("Session not found", { id: toastId });
      }

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
