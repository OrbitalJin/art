import { createContext, useContext, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";

import { useNoteStore } from "@/lib/store/use-note-store";
import type { Workspace } from "@/lib/store/notes/types";
import { editorExtensions, editorProps } from "@/lib/editor/config";
import { useEditorSync } from "@/hooks/use-editor-sync";
import { useEditorSave } from "@/hooks/use-editor-save";
import { useEditorStateSelector } from "@/hooks/use-editor-state-selector";
import { useTagNavigation } from "@/hooks/use-tag-navigation";

interface NoteEditorContextValue {
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

const NoteEditorContext = createContext<NoteEditorContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

export const NoteEditorProvider: React.FC<Props> = ({ children }) => {
  const activeId = useNoteStore((s) => s.activeId);
  const currentWorkspace = useNoteStore((s) => s.currentWorkspace);
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

  // Extracted hooks
  useEditorSync(editor, activeId);
  const { isEditable, isDisabled, toggleEditable, state } = useEditorStateSelector(editor);
  const { handleTagClick } = useTagNavigation(editor);

  return (
    <NoteEditorContext.Provider
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
    </NoteEditorContext.Provider>
  );
};

export const useNoteEditor = () => {
  const context = useContext(NoteEditorContext);

  if (!context) {
    throw new Error("useNoteEditor must be used within NoteEditorProvider");
  }

  return context;
};
