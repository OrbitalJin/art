import { useState } from "react";
import { Editor } from "@tiptap/react";

import { useImportImage } from "@/hooks/use-import-image";
import { previewUrl } from "@/lib/utils/images";

export const useEditorActions = (editor: Editor | null) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const { importImage } = useImportImage();

  const handleImageClick = async () => {
    if (!editor) return;

    const imported = await importImage();
    if (!imported) return;

    editor.chain().focus().setImage({ src: previewUrl(imported) }).run();
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
