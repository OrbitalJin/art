import { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { TAG_MARK_NAME } from "@/lib/editor/extensions/tag";

interface TagRange {
  from: number;
  to: number;
}

/** Locate the marked range containing `@tag`, or null when it is absent. */
export const findTagRange = (editor: Editor, tag: string): TagRange | null => {
  const needle = `@${tag}`;
  const result: { range: TagRange | null } = { range: null };

  editor.state.doc.descendants((node, pos) => {
    if (result.range) return false;

    if (
      node.isText &&
      node.text &&
      node.marks.some((mark) => mark.type.name === TAG_MARK_NAME)
    ) {
      const index = node.text.indexOf(needle);
      if (index !== -1) {
        result.range = {
          from: pos + index,
          to: pos + index + needle.length,
        };
        return false;
      }
    }
  });

  return result.range;
};

export const navigateToTag = (editor: Editor, tag: string) => {
  if (!editor) return false;

  const range = findTagRange(editor, tag);

  if (!range) {
    toast.error(`Tag @${tag} not found`);
    return false;
  }

  editor.chain().focus().setTextSelection(range).run();
  return true;
};
