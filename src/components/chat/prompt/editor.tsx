import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { cn } from "@/lib/utils";
import "@/styles/prompt-composer.css";
import { docFromText, inlineFromText } from "./text-content";
import {
  createStashSuggestion,
  type StashPickerState,
} from "./stash/stash-suggestion";

export interface PromptHandle {
  focus: () => void;
  insertText: (text: string) => void;
}

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  editable: boolean;
  autoFocus?: boolean;
  /** Called when Enter (or Shift+Enter, per settings) should send. */
  onSend: () => void;
  /** When true plain Enter sends and Shift+Enter breaks; otherwise reversed. */
  enterKeySends: boolean;
  /** Enable the inline "@" stash picker (agent sessions only). */
  stashSuggestion?: boolean;
  /** Intercept paste before Tiptap handles it. Return true when consumed. */
  onPaste?: (event: ClipboardEvent) => boolean;
  className?: string;
}

const editorClasses = cn(
  "prompt-composer min-h-[70px] max-h-[250px] lg:max-h-[400px] overflow-y-auto",
  "px-3.5 pt-3.5 pb-1 text-[15px] leading-[1.5] text-foreground/90",
  "whitespace-pre-wrap break-words outline-none",
);

export const PromptEditor = forwardRef<PromptHandle, PromptEditorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      editable,
      autoFocus,
      onSend,
      enterKeySends,
      stashSuggestion,
      onPaste,
      className,
    },
    ref,
  ) => {
    const editorRef = useRef<Editor | null>(null);
    const stashPickerRef = useRef<StashPickerState>({
      active: false,
      count: 0,
    });

    // Latest props for the editor callbacks, which are captured once at creation.
    const handlersRef = useRef({ onChange, onSend, enterKeySends, onPaste });
    useEffect(() => {
      handlersRef.current = { onChange, onSend, enterKeySends, onPaste };
    });

    const placeholderRef = useRef(placeholder);
    useEffect(() => {
      placeholderRef.current = placeholder;
    });

    const initialContent = useRef<JSONContent>(docFromText(value)).current;

    // Build the extension set once per composer instance: rebuilding it every
    // render makes Tiptap re-apply options and allocate fresh plugin keys.
    const extensions = useMemo(
      () => [
        StarterKit.configure({
          blockquote: false,
          bold: false,
          bulletList: false,
          code: false,
          codeBlock: false,
          dropcursor: false,
          gapcursor: false,
          heading: false,
          horizontalRule: false,
          italic: false,
          link: false,
          listItem: false,
          listKeymap: false,
          orderedList: false,
          strike: false,
          trailingNode: false,
          underline: false,
        }),
        Placeholder.configure({
          placeholder: () => placeholderRef.current,
        }),
        ...(stashSuggestion ? [createStashSuggestion(stashPickerRef)] : []),
      ],
      [stashSuggestion],
    );

    const editor = useEditor({
      extensions,
      content: initialContent,
      editable,
      autofocus: autoFocus ? "end" : false,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: cn(editorClasses, className),
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": placeholder,
        },
        handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
          if (event.isComposing || event.key !== "Enter") return false;

          // Let the stash picker consume Enter while it can select an entry.
          const picker = stashPickerRef.current;
          if (picker.active && picker.count > 0) return false;

          const { onSend: send, enterKeySends: sendsOnEnter } =
            handlersRef.current;
          const shouldSend = sendsOnEnter ? !event.shiftKey : event.shiftKey;

          if (shouldSend) {
            event.preventDefault();
            send();
            return true;
          }

          // Plain newline: insert a hard break instead of a new paragraph.
          event.preventDefault();
          const instance = editorRef.current;
          if (instance && !instance.isDestroyed)
            instance.commands.setHardBreak();
          return true;
        },
        handlePaste: (_view: EditorView, event: ClipboardEvent) =>
          handlersRef.current.onPaste?.(event) ?? false,
      },
      onUpdate: ({ editor: instance }) => {
        if (instance.isDestroyed) return;
        handlersRef.current.onChange(instance.getText());
      },
    });

    useEffect(() => {
      editorRef.current = editor ?? null;
    }, [editor]);

    // Keep the editor editable state in sync with key availability.
    useEffect(() => {
      if (editor && !editor.isDestroyed) editor.setEditable(editable);
    }, [editor, editable]);

    // Reflect external draft changes (session switch, starter prompts) that
    // replace the whole value rather than coming from typing.
    useEffect(() => {
      if (!editor || editor.isDestroyed) return;
      if (editor.getText() === value) return;
      editor.commands.setContent(docFromText(value), { emitUpdate: false });
    }, [editor, value]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          const instance = editorRef.current;
          if (instance && !instance.isDestroyed) instance.commands.focus("end");
        },
        insertText: (text: string) => {
          const instance = editorRef.current;
          if (!instance || instance.isDestroyed) return;
          const nodes = inlineFromText(text);
          if (nodes.length === 0) return;
          instance.chain().focus().insertContent(nodes).run();
        },
      }),
      [],
    );

    return <EditorContent editor={editor} />;
  },
);

PromptEditor.displayName = "PromptEditor";
