import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { TableKit } from "@tiptap/extension-table";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const Memo: React.FC<Props> = ({ className }) => {
  const setMemoContent = useIntervalStore((state) => state.setMemoContent);
  const content = useIntervalStore((state) => state.memoContent);
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
      className={cn(className, "p-6 text-sm tiptap focus:outline-none")}
    />
  );
};
