import { useCallback } from "react";
import { Editor } from "@tiptap/react";
import { navigateToTag } from "@/lib/editor/utils";

export const useTagNavigation = (editor: Editor | null) => {
  const handleTagClick = useCallback((tag: string) => {
    if (!editor) return;
    navigateToTag(editor, tag);
  }, [editor]);

  return { handleTagClick };
};