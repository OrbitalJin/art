import "@/styles/tiptap.css";
import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/notes/sidebar/static";
import { FloatingSidebar } from "@/components/notes/sidebar/floating";
import { EditorContextMenu } from "@/components/editor/context-menu/context-menu";
import { EditorContent } from "@tiptap/react";
import { Command } from "@/components/notes/command";
import { useNoteEditor } from "@/contexts/note-editor-context";

export const Notes = () => {
  const { isDisabled, editor, isSaving, wordCount, charCount } =
    useNoteEditor();

  return (
    <div className="relative flex-1 flex flex-row p-2 gap-2">
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
            "w-full h-full overflow-y-scroll max-w-3xl",
            "justify-center mx-auto p-1",
          )}
        >
          <EditorContent editor={editor} className="w-full h-full py-12" />
        </EditorContextMenu>

        <div className="absolute bottom-0 right-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border rounded-md px-2 py-1">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>

            {isSaving && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
