import { useState } from "react";
import { Editor } from "@tiptap/react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useImportImage } from "@/hooks/use-import-image";
import { useTextActions } from "@/hooks/use-text-actions";
import { toast } from "sonner";

export const useEditorActions = (editor: Editor | null) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isActonDialogOpen, setIsActionDialogOpen] = useState(false);
  const [textAction, setTextAction] = useState<
    "summarize" | "rephrase" | "bullet" | null
  >(null);

  const updateContent = useNoteStore((state) => state.updateContent);
  const activeId = useNoteStore((state) => state.activeId);
  const { importImage } = useImportImage();
  const { summarize, repharse, bullet, isBusy } = useTextActions();

  const handleImageClick = async () => {
    const base64 = await importImage();
    if (base64 && editor) {
      editor.chain().focus().setImage({ src: base64 }).run();
    }
  };

  const handleActionProcess = async (tone: string, instructions?: string) => {
    if (!editor || !textAction || !activeId) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const processingNoteId = activeId;

    if (!selectedText.trim()) return;

    const toastTitle =
      textAction === "summarize"
        ? "Summarizing"
        : textAction === "rephrase"
          ? "Rephrasing"
          : "Generating Bullet Points";
    const toastId = toast.loading(`${toastTitle}...`);

    try {
      const result =
        textAction === "summarize"
          ? await summarize.execute(selectedText, tone, instructions ?? "")
          : textAction === "rephrase"
            ? await repharse.execute(selectedText, tone, instructions ?? "")
            : await bullet.execute(selectedText, tone, instructions ?? "");

      if (!result) throw new Error("No result");

      if (useNoteStore.getState().activeId === processingNoteId) {
        editor.chain().focus().insertContentAt({ from, to }, result).run();
      } else {
        const entries = useNoteStore.getState().entries;
        const target = entries.find((entry) => entry.id === processingNoteId);

        if (target) {
          const updatedHtml = target.content.replace(selectedText, result);
          updateContent(processingNoteId, updatedHtml, true);
        }
      }
      toast.success("Success!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to process text", { id: toastId });
    } finally {
      setIsActionDialogOpen(false);
      setTextAction(null);
    }
  };

  return {
    dialogs: {
      link: { open: isLinkDialogOpen, setOpen: setIsLinkDialogOpen },
      ai: {
        open: isActonDialogOpen,
        setOpen: setIsActionDialogOpen,
        action: textAction,
        setAction: setTextAction,
      },
    },
    isBusy,
    handlers: { handleImageClick, handleAiProcess: handleActionProcess },
  };
};
