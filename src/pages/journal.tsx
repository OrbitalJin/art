import "@/styles/tiptap.css";

import { EditorContent } from "@tiptap/react";
import { useCallback, useEffect } from "react";
import { Eye, Pen, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/journal/sidebar/static";
import { FloatingSidebar } from "@/components/journal/sidebar/floating";
import { EditorContextMenu } from "@/components/journal/editor/context-menu/context-menu";
import { Command } from "@/components/journal/command";
import { useJournalEditor } from "@/contexts/note-editor-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { Button } from "@/components/ui/button";

export const Journal = () => {
  const { isDisabled, isEditable, toggleEditable, editor } = useJournalEditor();

  const journalState = useUIStateStore((state) => state.journalState);
  const setJournalState = useUIStateStore((state) => state.setJournalState);

  const { zoomLevel = 100 } = journalState;

  const setZoomLevel = useCallback(
    (level: number) => {
      setJournalState({
        ...journalState,
        zoomLevel: Math.min(200, Math.max(50, level)),
      });
    },
    [journalState, setJournalState],
  );

  const zoomIn = useCallback(() => {
    setZoomLevel(zoomLevel + 10);
  }, [zoomLevel, setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(zoomLevel - 10);
  }, [zoomLevel, setZoomLevel]);

  const zoomReset = useCallback(() => {
    setZoomLevel(100);
  }, [setZoomLevel]);

  const isOpen = journalState.sidebarOpen;
  const setIsOpen = (open: boolean) => {
    setJournalState({ ...journalState, sidebarOpen: open });
  };

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === "t" && e.altKey) {
        e.preventDefault();
        toggleEditable();
      }

      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (editor && !editor.state.selection.empty) {
          editor.chain().focus().toggleHighlight().run();
        }
      }

      if ((e.key === "=" || e.key === "+") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomIn();
      }

      if (e.key === "-" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomOut();
      }

      if (e.key === "0" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomReset();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [toggleEditable, editor, zoomIn, zoomOut, zoomReset]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative flex flex-1 flex-row gap-2 lg:px-0 border rounded-md">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={cn(
          "absolute top-3 right-3 z-30",
          "flex items-center gap-2 rounded-xl border border-border/60",
          "bg-background/80 backdrop-blur shadow-sm transition-all duration-300 opacity-70",
          "px-2 py-1.5",
          "hover:bg-background/90",
        )}
      >
        <div className="flex items-center gap-1">
          <Button
            onClick={zoomOut}
            variant="ghost"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
            disabled={zoomLevel <= 50}
          >
            <ZoomOut size={16} />
          </Button>

          <Button
            onClick={zoomReset}
            variant="ghost"
            className={cn(
              "h-8 min-w-[3.25rem] rounded-md px-2 text-xs font-medium",
              "tabular-nums text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
          >
            {zoomLevel}%
          </Button>

          <Button
            onClick={zoomIn}
            variant="ghost"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
            disabled={zoomLevel >= 200}
          >
            <ZoomIn size={16} />
          </Button>
        </div>

        <div className="h-5 w-px bg-border/70" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={"ghost"}
              size="icon"
              onClick={toggleEditable}
              aria-label={
                isEditable ? "Switch to read mode" : "Switch to edit mode"
              }
              className="h-8 gap-1.5 px-2.5"
            >
              {isEditable ? <Pen size={15} /> : <Eye size={15} />}
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            <div className="flex items-center gap-2">
              <span>
                {isEditable ? "Switch to read mode" : "Switch to edit mode"}
              </span>
              <KbdGroup>
                <Kbd>Alt</Kbd>
                <span>+</span>
                <Kbd>T</Kbd>
              </KbdGroup>
            </div>
          </TooltipContent>
        </Tooltip>
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
            "mx-auto h-full w-full max-w-5xl overflow-y-auto",
            "justify-center p-2 select-auto pt-14",
          )}
        >
          <div style={{ zoom: zoomLevel / 100 } as React.CSSProperties}>
            <EditorContent editor={editor} className="px-2" />
          </div>
        </EditorContextMenu>
      </div>

      <Command editor={editor} />
    </div>
  );
};
