import { useState } from "react";
import { Editor } from "@tiptap/react";

import { useImportImage } from "@/hooks/use-import-image";

export const useEditorActions = (editor: Editor | null) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

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
    },
    isBusy: false,
    handlers: {
      handleImageClick,
    },
  };
};
