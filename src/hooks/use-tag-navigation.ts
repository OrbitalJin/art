import { useCallback } from "react";
import { Editor } from "@tiptap/react";
import { toast } from "sonner";

export const findTagPosition = (editor: Editor, tag: string) => {
  const searchTerm = `@${tag}`;
  let foundPos = -1;

  editor.state.doc.descendants((node, pos) => {
    if (foundPos !== -1) return false;

    if (node.isText && node.text?.includes(searchTerm)) {
      const index = node.text.indexOf(searchTerm);
      foundPos = pos + index;
      return false;
    }
  });

  return foundPos;
};

export const navigateToTag = (editor: Editor, tag: string) => {
  if (!editor) return false;

  const pos = findTagPosition(editor, tag);

  if (pos === -1) {
    toast.error(`Tag @${tag} not found`);
    return false;
  }

  editor
    .chain()
    .focus()
    .setTextSelection({
      from: pos,
      to: pos + tag.length + 1,
    })
    .run();

  return true;
};

export const useTagNavigation = (editor: Editor | null) => {
  const handleTagClick = useCallback(
    (tag: string) => {
      if (!editor) return;
      navigateToTag(editor, tag);
    },
    [editor],
  );

  return { handleTagClick };
};
