import { useState } from "react";
import { Editor } from "@tiptap/react";
import { toast } from "sonner";

import { useJournalStore } from "@/lib/store/use-journal-store";
import { useImportImage } from "@/hooks/use-import-image";
import { useTextActions } from "@/hooks/use-text-actions";
import type { LLMActions } from "@/lib/types";

const getToastTitle = (action: LLMActions) => {
  switch (action) {
    case "summarize":
      return "Summarizing";
    case "rephrase":
      return "Rephrasing";
    case "bullet":
      return "Generating Bullet Points";
    default:
      return "Processing";
  }
};

export const useEditorActions = (editor: Editor | null) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [textAction, setTextAction] = useState<LLMActions | null>(null);

  const updateContent = useJournalStore((state) => state.updateContent);
  const activeId = useJournalStore((state) => state.activeId);

  const { importImage } = useImportImage();
  const { summarize, repharse, bullet, isBusy } = useTextActions();

  const runTextAction = async (
    action: LLMActions,
    text: string,
    tone: string,
    instructions: string,
  ) => {
    switch (action) {
      case "summarize":
        return summarize.execute(text, tone, instructions);
      case "rephrase":
        return repharse.execute(text, tone, instructions);
      case "bullet":
        return bullet.execute(text, tone, instructions);
    }
  };

  const handleImageClick = async () => {
    if (!editor) return;

    const base64 = await importImage();
    if (!base64) return;

    editor.chain().focus().setImage({ src: base64 }).run();
  };

  // Processes the currently selected text using an LLM action.
  // Safely handles note switching during async execution.
  const handleActionProcess = async (tone: string, instructions?: string) => {
    if (!editor || !textAction || !activeId) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to).trim();

    if (!selectedText) return;

    const processingNoteId = activeId;
    const toastId = toast.loading(`${getToastTitle(textAction)}...`);

    try {
      const result = await runTextAction(
        textAction,
        selectedText,
        tone,
        instructions ?? "",
      );

      if (!result) {
        throw new Error("Empty LLM response");
      }

      // If the same note is still active, update editor directly
      if (useJournalStore.getState().activeId === processingNoteId) {
        editor.chain().focus().insertContentAt({ from, to }, result).run();
      } else {
        // Otherwise update the stored content safely
        const { pages } = useJournalStore.getState();
        const target = pages.find((page) => page.id === processingNoteId);

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
      link: {
        open: isLinkDialogOpen,
        setOpen: setIsLinkDialogOpen,
      },
      llm: {
        open: isActionDialogOpen,
        setOpen: setIsActionDialogOpen,
        action: textAction,
        setAction: setTextAction,
      },
    },
    isBusy,
    handlers: {
      handleImageClick,
      handleAiProcess: handleActionProcess,
    },
  };
};
