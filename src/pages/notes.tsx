import "@/styles/tiptap.css";

import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/notes/sidebar/static";
import { FloatingSidebar } from "@/components/notes/sidebar/floating";
import { EditorContextMenu } from "@/components/notes/editor/context-menu/context-menu";
import { Command } from "@/components/notes/command";
import { useNoteEditor } from "@/contexts/note-editor-context";

export const Notes = () => {
  const { isDisabled, editor } = useNoteEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="relative flex flex-1 flex-row gap-2 lg:px-0">
      <StaticSidebar />
      <FloatingSidebar />

      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden",
          isDisabled && "pointer-events-none opacity-80",
        )}
      >
        <EditorContextMenu
          editor={editor}
          className={cn(
            "mx-auto h-full w-full max-w-3xl overflow-y-auto",
            "justify-center p-2 select-auto pt-12",
          )}
        >
          <EditorContent editor={editor} className="h-full w-full px-2" />
        </EditorContextMenu>
      </div>

      <Command editor={editor} />
    </div>
  );
};
