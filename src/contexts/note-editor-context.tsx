import { createContext, useContext, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";

import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Workspace } from "@/lib/store/journal/types";
import { editorExtensions, editorProps } from "@/lib/editor/config";
import { useEditorSync } from "@/hooks/use-editor-sync";
import { useEditorSave } from "@/hooks/use-editor-save";
import { useEditorStateSelector } from "@/hooks/use-editor-state-selector";
import { useTagNavigation } from "@/hooks/use-tag-navigation";

interface JournalEditorContextValue {
  editor: Editor | null;
  wordCount: number;
  charCount: number;
  isSaving: boolean;
  isDisabled: boolean;
  isEditable: boolean;
  currentTab: Workspace;
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
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState<Workspace>(currentWorkspace);

  const { handleSave } = useEditorSave(activeId);

  const editor = useEditor({
    editable: false,
    immediatelyRender: true,
    extensions: editorExtensions,
    editorProps,
    onUpdate: ({ editor }) => {
      // @ts-expect-error tiptap-markdown adds this at runtime
      const markdown = editor.storage.markdown.getMarkdown();
      handleSave(markdown, setIsSaving);
    },
  });

  useEditorSync(editor, activeId);
  const { isEditable, isDisabled, toggleEditable, state } =
    useEditorStateSelector(editor);
  const { handleTagClick } = useTagNavigation(editor);

  return (
    <JournalEditorContext.Provider
      value={{
        editor,
        wordCount: state?.wordCount ?? 0,
        charCount: state?.charCount ?? 0,
        isSaving,
        isDisabled,
        isEditable,
        currentTab,
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
