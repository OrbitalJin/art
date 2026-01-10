import "@/styles/tiptap.css";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { StaticSidebar } from "@/components/notes/sidebar/static";
import type { Workspace } from "@/lib/store/notes/types";
import { FloatingSidebar } from "@/components/notes/sidebar/floating";
import { EditorContextMenu } from "@/components/editor/context-menu";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { EditorContent } from "@tiptap/react";
import { useNoteStore } from "@/lib/store/use-note-store";

export const Notes = () => {
  const { isDisabled, editor, isSaving, wordCount, charCount } =
    useNoteEditor();
  const currentWorkspace = useNoteStore((state) => state.currentWorkspace);
  const [currentTab, setCurrentTab] = useState<Workspace>(currentWorkspace);

  if (!editor) return null;

  return (
    <div className="relative flex-1 flex flex-row p-2 gap-2">
      <StaticSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <FloatingSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground mix-blend-difference">
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
