import { useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { useEditorState as useTipTapEditorState } from "@tiptap/react";
import { useNoteStore } from "@/lib/store/use-note-store";

export const useEditorStateSelector = (editor: Editor | null) => {
  const [isEditable, setIsEditable] = useState(false);
  const isDisabled = useNoteStore((s) => s.entries.length === 0);

  const state = useTipTapEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) {
        return {
          wordCount: 0,
          charCount: 0,
          hasSelection: false,
          canUndo: false,
          canRedo: false,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isHighlight: false,
          isBulletList: false,
          isOrderedList: false,
          isBlockquote: false,
          isCodeBlock: false,
          isTable: false,
          isLink: false,
        };
      }
      return {
        wordCount: ctx.editor.storage.characterCount.words(),
        charCount: ctx.editor.storage.characterCount.characters(),
        hasSelection: !ctx.editor?.state.selection.empty,
        canUndo: ctx.editor?.can().undo() ?? false,
        canRedo: ctx.editor?.can().redo() ?? false,
        isBold: ctx.editor?.isActive("bold") ?? false,
        isItalic: ctx.editor?.isActive("italic") ?? false,
        isUnderline: ctx.editor?.isActive("underline") ?? false,
        isStrike: ctx.editor?.isActive("strike") ?? false,
        isHighlight: ctx.editor?.isActive("highlight") ?? false,
        isBulletList: ctx.editor?.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
        isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
        isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
        isTable: ctx.editor?.isActive("table") ?? false,
        isLink: ctx.editor?.isActive("link") ?? false,
      };
    },
  });

  const toggleEditable = useCallback(() => {
    const newEditable = !isEditable;
    setIsEditable(newEditable);
    editor?.setEditable(newEditable);
  }, [isEditable, editor]);

  return {
    state,
    isEditable,
    isDisabled,
    toggleEditable,
  };
};
