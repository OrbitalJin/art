import "@/styles/tiptap.css";

import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/journal/sidebar/static";
import { FloatingSidebar } from "@/components/journal/sidebar/floating";
import { EditorContextMenu } from "@/components/journal/editor/context-menu/context-menu";
import { Command } from "@/components/journal/command";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Asterisk, Eye, Pen } from "lucide-react";
import { useEffect } from "react";

export const Journal = () => {
  const {
    isDisabled,
    isEditable,
    toggleEditable,
    setEditable,
    isSaving,
    editor,
  } = useJournalEditor();
  const isOpen = useSettingsStore((state) => state.notesSidebarOpen);
  const setIsOpen = useSettingsStore((state) => state.setNotesSidebarOpen);

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleEditable();
      }
    };

    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [toggleEditable]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative flex flex-1 flex-row gap-2 lg:px-0">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={cn(
          "flex flex-row items-center gap-2",
          "absolute top-2 right-2 z-30",
          "opacity-70 hover:opacity-100 transition-all duration-300",
        )}
      >
        <div
          className={`
            transition-all duration-500 ease-in-out
            ${isSaving ? "opacity-100 scale-100" : "opacity-0 scale-70 pointer-events-none"}
          `}
        >
          <div className="animate-spin">
            <div className="animate-pulse">
              <Asterisk size={20} />
            </div>
          </div>
        </div>
        <Tabs
          value={isEditable ? "edit" : "preview"}
          onValueChange={(v) => setEditable(v === "edit")}
        >
          <TabsList>
            <TabsTrigger className="aspect-square" value="edit">
              <Pen />
            </TabsTrigger>
            <TabsTrigger className="aspect-square" value="preview">
              <Eye />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
