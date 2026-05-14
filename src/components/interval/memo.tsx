import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useIntervalsStore } from "@/lib/store/use-intervals-store";
import { TableKit } from "@tiptap/extension-table";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Markdown } from "tiptap-markdown";

export const Memo = () => {
  const setMemoContent = useIntervalsStore((state) => state.setMemoContent);
  const content = useIntervalsStore((state) => state.memoContent);
  const editor = useEditor({
    content,
    extensions: [
      StarterKit,
      TableKit,
      Highlight,
      Typography,
      Placeholder.configure({ placeholder: "Memo..." }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    immediatelyRender: true,
    onUpdate: ({ editor }) => {
      setMemoContent(editor.getHTML());
    },
  });
  return (
    <EditorContent
      editor={editor}
      className="p-6 text-sm tiptap focus:outline-none"
    />
  );
};
