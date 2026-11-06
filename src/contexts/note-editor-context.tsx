import { createContext, useContext, useEffect, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";

import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Workspace } from "@/lib/store/journal/types";
import { editorExtensions, editorProps } from "@/lib/editor/config";
import { useEditorSync } from "@/hooks/use-editor-sync";
import { useEditorStateSelector } from "@/hooks/use-editor-state-selector";
import { useTagNavigation } from "@/hooks/use-tag-navigation";

interface JournalEditorContextValue {
  editor: Editor | null;
  wordCount: number;
  charCount: number;
  isDisabled: boolean;
  isEditable: boolean;
  isSaving: boolean;
  currentTab: Workspace;
  setEditable: (editable: boolean) => void;
  toggleEditable: () => void;
  setCurrentTab: (tab: Workspace) => void;
  handleTagClick: (tag: string) => void;
}

const JournalEditorContext = createContext<JournalEditorContextValue | null>(
  null,
);

interface Props {
  children: React.ReactNode;
}

export const JournalEditorProvider: React.FC<Props> = ({ children }) => {
  const activeId = useJournalStore((s) => s.activeId);
  const currentWorkspace = useJournalStore((s) => s.currentWorkspace);
  const [currentTab, setCurrentTab] = useState<Workspace>(currentWorkspace);

  useEffect(() => {
    setCurrentTab(currentWorkspace);
  }, [currentWorkspace]);

  const editor = useEditor({
    editable: true,
    // Do not create the editor during render. `useEditor` otherwise schedules
    // an immediate teardown (~1ms) of the render-created instance, which can
    // destroy it before this component's first effects run and hand consumers
    // a destroyed editor (see tiptap#8400). Creating it on mount avoids that.
    immediatelyRender: false,
    extensions: editorExtensions,
    editorProps,
  });

  const { isSaving } = useEditorSync(editor, activeId);
  const { isEditable, isDisabled, setEditable, toggleEditable, state } =
    useEditorStateSelector(editor);
  const { handleTagClick } = useTagNavigation(editor);

  return (
    <JournalEditorContext.Provider
      value={{
        editor,
        wordCount: state?.wordCount ?? 0,
        charCount: state?.charCount ?? 0,
        isDisabled,
        isEditable,
        isSaving,
        currentTab,
        setEditable,
        setCurrentTab,
        handleTagClick,
        toggleEditable,
      }}
    >
      {children}
    </JournalEditorContext.Provider>
  );
};

export const useJournalEditor = () => {
  const context = useContext(JournalEditorContext);

  if (!context) {
    throw new Error("useJournalEditor must be used within NoteEditorProvider");
  }

  return context;
};
