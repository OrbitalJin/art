import "@/styles/tiptap.css";
import {
  useEditor,
  EditorContent,
  useEditorState,
  Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { EditorToolbar } from "@/components/editor/toolbar";
import { ListKit } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";

export interface EditorStateObject {
  editor: Editor;
  wordCount: number;
  characterCount: number;
}

export const Notes = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit,
      ListKit,
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    immediatelyRender: true,
  });

  const editorState = useEditorState({
    editor: editor,
    selector: (ctx) => {
      return {
        editor: ctx.editor,
        wordCount: ctx.editor.storage.characterCount.words(),
        characterCount: ctx.editor.storage.characterCount.characters(),
      };
    },
  });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Editor Content */}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex backdrop-blur-md">
        <EditorToolbar state={editorState} />
      </div>
      <div className="relative flex-1 flex h-full overflow-scroll max-w-3xl justify-center mx-auto p-2 pt-12">
        <EditorContent className="w-2xl lg:w-3xl" editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{editorState.wordCount} words</span>
        <span>•</span>
        <span>{editorState.characterCount} characters</span>
      </div>
    </div>
  );
};
