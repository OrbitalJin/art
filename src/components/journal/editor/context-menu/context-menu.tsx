import React, { useMemo } from "react";
import type { Editor } from "@tiptap/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LinkDialog } from "./link-dialog";
import { useEditorActions } from "@/hooks/use-editor-actions";
import { getMenuGroups } from "@/components/journal/editor/editor-menu";
import { EditorItemRenderer } from "./item";
import { TextActionDialog } from "./text-action-dialog";
import { useEditorStateSelector } from "@/hooks/use-editor-state-selector";
import { Copy } from "lucide-react";
import { useJournalEditor } from "@/contexts/note-editor-context";

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
  const { state: editorState } = useEditorStateSelector(editor);
  const { isEditable } = useJournalEditor();

  const menuGroups = useMemo(() => {
    if (!editor || !editorState) return [];
    return getMenuGroups(editor, editorState, actions);
  }, [editor, editorState, actions]);

  const handleCopy = () => {
    const { from, to, empty } = editor.state.selection;
    if (empty) return;

    const text = editor.state.doc.textBetween(from, to, " ");
    navigator.clipboard.writeText(text);
  };

  if (!editor) return <div className={className}>{children}</div>;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className={className}>
          {children}
        </ContextMenuTrigger>

        {isEditable ? (
          <ContextMenuContent className="w-64">
            {menuGroups.map((group, idx) => (
              <React.Fragment key={idx}>
                {group.map((item) => (
                  <EditorItemRenderer key={item.label} item={item} />
                ))}
              </React.Fragment>
            ))}
          </ContextMenuContent>
        ) : (
          editorState?.hasSelection && (
            <ContextMenuContent className="w-64">
              <ContextMenuItem
                onClick={handleCopy}
                disabled={editor.state.selection.empty}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </ContextMenuItem>
            </ContextMenuContent>
          )
        )}
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
