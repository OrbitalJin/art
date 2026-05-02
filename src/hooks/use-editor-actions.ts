import { useState } from "react";
import { Editor } from "@tiptap/react";

import { useImportImage } from "@/hooks/use-import-image";
import type { LLMActions } from "@/lib/types";

export const useEditorActions = (editor: Editor | null) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [textAction, setTextAction] = useState<LLMActions | null>(null);

  const { importImage } = useImportImage();

  const handleImageClick = async () => {
    if (!editor) return;

    const base64 = await importImage();
    if (!base64) return;

    editor.chain().focus().setImage({ src: base64 }).run();
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
    isBusy: false,
    handlers: {
      handleImageClick,
    },
  };
};
