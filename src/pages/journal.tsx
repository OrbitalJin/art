import "@/styles/tiptap.css";

import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/journal/sidebar/static";
import { FloatingSidebar } from "@/components/journal/sidebar/floating";
import { EditorContextMenu } from "@/components/journal/editor/context-menu/context-menu";
import { Command } from "@/components/journal/command";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Journal = () => {
  const { isDisabled, isEditable, toggleEditable, isSaving, editor } =
    useJournalEditor();
  const isOpen = useSettingsStore((state) => state.notesSidebarOpen);
  const setIsOpen = useSettingsStore((state) => state.setNotesSidebarOpen);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative flex flex-1 flex-row gap-2 lg:px-0">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="absolute top-2 right-2 z-30 opacity-70"
            variant={isSaving ? "ghost" : "outline"}
            onClick={toggleEditable}
            size="icon"
          >
            {isSaving ? (
              <Loader2 className="animate-spin opacity-70" />
            ) : isEditable ? (
              <Edit3 />
            ) : (
              <Eye />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isEditable ? "Editing" : "Viewing"}
        </TooltipContent>
      </Tooltip>

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
