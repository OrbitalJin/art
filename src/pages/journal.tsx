import "@/styles/rich-editor.css";

import { EditorContent } from "@tiptap/react";
import { useCallback, useEffect } from "react";
import { Eye, Pen, ZoomIn, ZoomOut } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";

import { cn } from "@/lib/utils";
import { StaticSidebar } from "@/components/journal/sidebar/static";
import { FloatingSidebar } from "@/components/journal/sidebar/floating";
import { EditorContextMenu } from "@/components/journal/editor/context-menu/context-menu";
import { Command } from "@/components/journal/command";
import {
  JournalEditorProvider,
  useJournalEditor,
} from "@/contexts/note-editor-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

const PillButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ label, onClick, disabled = false, className, children }) => {
  const buttonClassName = cn(
    "h-6 rounded-full text-muted-foreground transition-colors duration-150",
    "hover:bg-accent/60 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-40",
    className,
  );

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </Button>
  );
};

const PillDivider: React.FC = () => (
  <span aria-hidden className="h-3.5 w-px shrink-0 bg-border/60" />
);

interface EditorToolbarProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isEditable: boolean;
  onToggleEditable: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isEditable,
  onToggleEditable,
}) => {
  const modeLabel = isEditable ? "Switch to read mode" : "Switch to edit mode";

  const wrapperClassName = cn(
    "absolute bottom-3 right-3 z-30 transition-opacity duration-200",
    "opacity-70 hover:opacity-100",
  );

  const pillClassName = cn(
    "flex items-center gap-1.5 rounded-full p-1",
    "border border-border/40 bg-card/40 ring-1 ring-inset ring-foreground/5",
    "shadow-lg shadow-black/10 backdrop-blur-xl",
  );

  const iconButtonClassName = "w-6 p-0";
  const percentClassName = "min-w-12 px-2 text-xs font-medium tabular-nums";

  return (
    <div className={wrapperClassName}>
      <div className={pillClassName}>
        <PillButton
          label="Zoom out"
          onClick={onZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          className={iconButtonClassName}
        >
          <ZoomOut strokeWidth={1.75} className="size-3.5" />
        </PillButton>

        <PillButton
          label="Reset zoom"
          onClick={onZoomReset}
          className={percentClassName}
        >
          {zoomLevel}%
        </PillButton>

        <PillButton
          label="Zoom in"
          onClick={onZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          className={iconButtonClassName}
        >
          <ZoomIn strokeWidth={1.75} className="size-3.5" />
        </PillButton>

        <PillDivider />

        <Tooltip>
          <TooltipTrigger asChild>
            <PillButton
              label={modeLabel}
              onClick={onToggleEditable}
              className={iconButtonClassName}
            >
              {isEditable ? (
                <Pen strokeWidth={1.75} className="size-3.5" />
              ) : (
                <Eye strokeWidth={1.75} className="size-3.5" />
              )}
            </PillButton>
          </TooltipTrigger>

          <TooltipContent side="top">
            <div className="flex items-center gap-2">
              <span>{modeLabel}</span>
              <KbdGroup>
                <Kbd>Alt</Kbd>
                <span>+</span>
                <Kbd>T</Kbd>
              </KbdGroup>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const JournalContent = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const hydrated = useJournalIndex((s) => s.hydrated);
  const activeId = useJournalIndex((s) => s.activeId);

  // The route owns "which page is open". Once hydrated, resolve a missing id
  // to the active/first page, and bounce ids that no longer exist.
  useEffect(() => {
    if (!hydrated) return;

    if (!pageId) {
      const fallback =
        activeId ?? useJournalIndex.getState().pages[0]?.id ?? null;
      if (fallback) navigate(`/journal/${fallback}`, { replace: true });
      return;
    }

    if (!useJournalIndex.getState().getPage(pageId)) {
      navigate("/journal", { replace: true });
    }
  }, [hydrated, pageId, activeId, navigate]);

  useEffect(() => {
    if (hydrated && pageId) useJournalIndex.getState().setActive(pageId);
  }, [hydrated, pageId]);

  const journalState = useUIStateStore((state) => state.journalState);
  const setJournalState = useUIStateStore((state) => state.setJournalState);

  const isOpen = journalState.sidebarOpen;
  const setIsOpen = (open: boolean) => {
    setJournalState({ sidebarOpen: open });
  };

  if (!hydrated || !pageId) return null;

  return (
    <div className="relative flex flex-1 flex-row gap-2 lg:px-0">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <JournalEditorProvider pageId={pageId}>
        <EditorPane />
      </JournalEditorProvider>
    </div>
  );
};

const EditorPane = () => {
  const { editor, isEditable, toggleEditable } = useJournalEditor();

  const journalState = useUIStateStore((state) => state.journalState);
  const setJournalState = useUIStateStore((state) => state.setJournalState);

  const { zoomLevel = 100 } = journalState;

  const setZoomLevel = useCallback(
    (level: number) => {
      setJournalState({
        zoomLevel: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level)),
      });
    },
    [setJournalState],
  );

  const zoomIn = useCallback(() => {
    setZoomLevel(zoomLevel + ZOOM_STEP);
  }, [zoomLevel, setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(zoomLevel - ZOOM_STEP);
  }, [zoomLevel, setZoomLevel]);

  const zoomReset = useCallback(() => {
    setZoomLevel(100);
  }, [setZoomLevel]);

  useHotkey("Alt+T", () => toggleEditable(), { ignoreInputs: false });

  useHotkey("Mod+H", () => {
    if (editor && !editor.state.selection.empty) {
      editor.chain().focus().toggleHighlight().run();
    }
  });

  useHotkey("Mod+=", zoomIn);
  useHotkey({ key: "+", mod: true, shift: true }, zoomIn);
  useHotkey("Mod+-", zoomOut);
  useHotkey("Mod+0", zoomReset);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [zoomIn, zoomOut]);

  if (!editor) {
    return null;
  }

  const zoomStyle: React.CSSProperties = { zoom: zoomLevel / 100 };

  return (
    <>
      <EditorToolbar
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        isEditable={isEditable}
        onToggleEditable={toggleEditable}
      />

      <div
        className={cn("relative flex h-full w-full flex-col overflow-hidden")}
      >
        <EditorContextMenu
          editor={editor}
          className={cn(
            "mx-auto h-full w-full max-w-5xl overflow-y-auto",
            "justify-center p-2 select-auto pt-14",
          )}
        >
          <div style={zoomStyle}>
            <EditorContent editor={editor} className="px-2" />
          </div>
        </EditorContextMenu>
      </div>

      <Command editor={editor} />
    </>
  );
};

export const Journal = () => <JournalContent />;
