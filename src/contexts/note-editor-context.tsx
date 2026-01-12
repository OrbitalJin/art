import { Editor } from "@tiptap/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { ListKit } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

import { useNoteStore } from "@/lib/store/use-note-store";
import { useDebounce } from "@/hooks/use-debounce";
import { extractTags } from "@/lib/utils/tags";
import { TagHighlighter } from "@/lib/extensions/tag-highlighter";
import type { Workspace } from "@/lib/store/notes/types";

interface NoteEditorContextValue {
  editor: Editor | null;
  wordCount: number;
  charCount: number;
  isSaving: boolean;
  isDisabled: boolean;
  currentTab: Workspace;
  setCurrentTab: (tab: Workspace) => void;
  handleTagClick: (tag: string) => void;
}

const NoteEditorContext = createContext<NoteEditorContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

const editorExtensions = [
  StarterKit,
  TableKit,
  ListKit,
  Highlight,
  HorizontalRule,
  TagHighlighter,
  Image.configure({
    inline: true,
    allowBase64: true,
    resize: {
      enabled: true,
      directions: ["bottom-right"],
      minWidth: 100,
      minHeight: 100,
      alwaysPreserveAspectRatio: true,
    },
  }),
  Markdown.configure({
    html: true,
    transformPastedText: true,
    transformCopiedText: true,
  }),
  CharacterCount.configure({ limit: 50000 }),
];

const editorProps = {
  attributes: {
    class: "tiptap focus:outline-none",
  },
  handleClick: (_: unknown, __: unknown, event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (link && link.href) {
      event.preventDefault();
      openUrl(link.href);
      toast.info("Opening link...");
      return true;
    }

    return false;
  },
};

const findTagPosition = (editor: Editor, tag: string) => {
  const searchTerm = `@${tag}`;
  let foundPos = -1;

  editor.state.doc.descendants((node, pos) => {
    if (foundPos !== -1) return false;

    if (node.isText && node.text?.includes(searchTerm)) {
      const index = node.text.indexOf(searchTerm);
      foundPos = pos + index;
      return false;
    }
  });

  return foundPos;
};

export const NoteEditorProvider: React.FC<Props> = ({ children }) => {
  const activeId = useNoteStore((s) => s.activeId);
  const note = useNoteStore((s) => s.getFn(activeId ?? ""));
  const updateContent = useNoteStore((s) => s.updateContent);
  const updateTags = useNoteStore((s) => s.updateTags);
  const isDisabled = useNoteStore((s) => s.entries.length === 0);

  const currentWorkspace = useNoteStore((s) => s.currentWorkspace);

  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState<Workspace>(currentWorkspace);

  const debouncedSave = useDebounce((markdown: string) => {
    if (!activeId) return;

    const tags = extractTags(markdown);
    updateTags(activeId, tags);
    updateContent(activeId, markdown, false);
    setIsSaving(false);
  }, 1000);

  const editor = useEditor({
    immediatelyRender: true,
    extensions: editorExtensions,
    editorProps,
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      // @ts-expect-error tiptap-markdown adds this at runtime
      debouncedSave(editor.storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor || !activeId || !note) {
      editor?.commands.clearContent();
      return;
    }

    // @ts-expect-error tiptap-markdown adds this at runtime
    const currentMarkdown = editor.storage.markdown.getMarkdown();

    if (currentMarkdown === note.content) return;

    editor.commands.setContent(note.content);
  }, [activeId, editor, note]);

  useEffect(() => {
    return () => {
      if (editor && activeId) {
        // @ts-expect-error tiptap-markdown adds this at runtime
        updateContent(activeId, editor.storage.markdown.getMarkdown(), false);
      }
    };
  }, [activeId, editor, updateContent]);

  const { wordCount, charCount } = useEditorState({
    editor,
    selector: (ctx) => ({
      wordCount: ctx.editor.storage.characterCount.words(),
      charCount: ctx.editor.storage.characterCount.characters(),
    }),
  });

  const handleTagClick = (tag: string) => {
    if (!editor) return;

    const pos = findTagPosition(editor, tag);

    if (pos === -1) {
      toast.error(`Tag @${tag} not found`);
      return;
    }

    editor
      .chain()
      .focus()
      .setTextSelection({
        from: pos,
        to: pos + tag.length + 1,
      })
      .run();
  };

  return (
    <NoteEditorContext.Provider
      value={{
        editor,
        wordCount,
        charCount,
        isSaving,
        isDisabled,
        currentTab,
        setCurrentTab,
        handleTagClick,
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
