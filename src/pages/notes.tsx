import "@/styles/tiptap.css";

import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/notes/sidebar/static";
import { FloatingSidebar } from "@/components/notes/sidebar/floating";
import { EditorContextMenu } from "@/components/editor/context-menu/context-menu";
import { Command } from "@/components/notes/command";
import { useNoteEditor } from "@/contexts/note-editor-context";

export const Notes = () => {
  const { isDisabled, editor } = useNoteEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="relative flex flex-1 flex-row gap-2 px-2 lg:px-0">
      <Command editor={editor} />
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
            "mx-auto h-full w-full max-w-3xl overflow-y-scroll",
            "justify-center p-1 select-auto",
          )}
        >
          <EditorContent editor={editor} className="h-full w-full py-12" />
        </EditorContextMenu>
      </div>
    </div>
  );
};
