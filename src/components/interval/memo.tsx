import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useIntervalsStore } from "@/lib/store/use-intervals-store";
import { TableKit } from "@tiptap/extension-table";
import { ListKit } from "@tiptap/extension-list";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
export const Memo = () => {
  const setMemoContent = useIntervalsStore((state) => state.setMemoContent);
  const content = useIntervalsStore((state) => state.memoContent);
  const editor = useEditor({
    content,
    extensions: [
      StarterKit,
      TableKit,
      ListKit,
      Highlight,
      Typography,
      Placeholder.configure({ placeholder: "Memo..." }),
    ],
    immediatelyRender: true,
    onUpdate: ({ editor }) => {
      setMemoContent(editor.getHTML());
    },
  });
  return <EditorContent editor={editor} className="p-2 text-sm" />;
};
