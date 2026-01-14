// components/editor/editor-context-menu.tsx
import React, { useMemo } from "react";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LinkDialog } from "./link-dialog";
import { useEditorActions } from "@/hooks/use-editor-actions";
import { getMenuGroups } from "@/lib/schema/editor-menu";
import { EditorItemRenderer } from "./item";
import { TextActionDialog } from "./text-action-dialog";

interface Props {
  children: React.ReactNode;
  editor: Editor;
  className?: string;
}

export const EditorContextMenu: React.FC<Props> = ({
  editor,
  className,
  children,
}) => {
  const actions = useEditorActions(editor);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      hasSelection: !ctx.editor.state.selection.empty,
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrike: ctx.editor.isActive("strike"),
      isHighlight: ctx.editor.isActive("highlight"),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isBlockquote: ctx.editor.isActive("blockquote"),
      isCodeBlock: ctx.editor.isActive("codeBlock"),
      isTable: ctx.editor.isActive("table"),
      isLink: ctx.editor.isActive("link"),
    }),
  });

  const menuGroups = useMemo(() => {
    if (!editor || !editorState) return [];
    return getMenuGroups(editor, editorState, actions);
  }, [editor, editorState, actions]);

  if (!editor) return <div className={className}>{children}</div>;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className={className}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {menuGroups.map((group, idx) => (
            <React.Fragment key={idx}>
              {group.map((item) => (
                <EditorItemRenderer key={item.label} item={item} />
              ))}
            </React.Fragment>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      <LinkDialog
        isOpen={actions.dialogs.link.open}
        onOpenChange={actions.dialogs.link.setOpen}
        onAddLink={(url) => {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
          actions.dialogs.link.setOpen(false);
        }}
      />

      <TextActionDialog
        isOpen={actions.dialogs.llm.open}
        onOpenChange={actions.dialogs.llm.setOpen}
        onProcess={actions.handlers.handleAiProcess}
        action={actions.dialogs.llm.action || "summarize"}
        isProcessing={actions.isBusy}
      />
    </>
  );
};
