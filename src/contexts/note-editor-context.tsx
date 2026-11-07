import { createContext, useContext, useEffect, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";

import { journalContentStore } from "@/lib/store/journal/content-store";
import { editorExtensions, editorProps } from "@/lib/editor/config";
import { useEditorSync } from "@/hooks/use-editor-sync";

interface JournalEditorContextValue {
  editor: Editor | null;
  isEditable: boolean;
  toggleEditable: () => void;
}

const JournalEditorContext = createContext<JournalEditorContextValue | null>(
  null,
);

interface ProviderProps {
  pageId: string;
  children: React.ReactNode;
}

/**
 * Resolves the page body, then mounts one editor instance per page. The `key`
 * makes each instance belong to exactly one note: no content swapping, no
 * cross-note undo history, and saves can never land on the wrong id.
 */
export const JournalEditorProvider: React.FC<ProviderProps> = ({
  pageId,
  children,
}) => {
  const [loaded, setLoaded] = useState<{
    pageId: string;
    markdown: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void journalContentStore
      .getState()
      .ensure(pageId)
      .then((body) => {
        if (active) setLoaded({ pageId, markdown: body });
      });
    return () => {
      active = false;
    };
  }, [pageId]);

  if (loaded?.pageId !== pageId) return null;

  return (
    <PageEditor key={pageId} pageId={pageId} initialMarkdown={loaded.markdown}>
      {children}
    </PageEditor>
  );
};

interface PageEditorProps {
  pageId: string;
  initialMarkdown: string;
  children: React.ReactNode;
}

const PageEditor: React.FC<PageEditorProps> = ({
  pageId,
  initialMarkdown,
  children,
}) => {
  const editor = useEditor({
    editable: true,
    // Do not create the editor during render. `useEditor` otherwise schedules
    // an immediate teardown (~1ms) of the render-created instance, which can
    // destroy it before this component's first effects run and hand consumers
    // a destroyed editor (see tiptap#8400). Creating it on mount avoids that.
    immediatelyRender: false,
    extensions: editorExtensions,
    editorProps,
    content: initialMarkdown,
  });

  useEditorSync(editor, pageId);

  const [isEditable, setIsEditable] = useState(true);
  const toggleEditable = () => {
    const next = !isEditable;
    setIsEditable(next);
    editor?.setEditable(next);
  };

  return (
    <JournalEditorContext.Provider
      value={{ editor, isEditable, toggleEditable }}
    >
      {children}
    </JournalEditorContext.Provider>
  );
};

export const useJournalEditor = () => {
  const context = useContext(JournalEditorContext);

  if (!context) {
    throw new Error("useJournalEditor must be used within JournalEditorProvider");
  }

  return context;
};
