import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { useJournalStore } from "@/lib/store/use-journal-store";
import {
  JournalSuggestionList,
  type JournalSuggestionListHandle,
  type JournalSuggestionListProps,
} from "./journal-suggestion-list";
import type { Workspace } from "@/lib/store/journal/types";

/** A journal entry offered by the inline "#" picker. */
export interface JournalSuggestionItem {
  id: string;
  label: string;
  workspace: Workspace;
  preview: string;
}

/**
 * Live state of the journal picker, readable from the composer's key handler
 * so Enter is reserved for the picker only when it can select something.
 */
export interface JournalPickerState {
  active: boolean;
  count: number;
}

type PickerStateRef = { current: JournalPickerState };
type Item = JournalSuggestionItem;
type Props = SuggestionProps<Item, Item>;

export const JOURNAL_SUGGESTION_CHAR = "#";

const pluginKey = new PluginKey("journalSuggestion");

const previewOf = (content: string): string => {
  const single = content.replace(/\s+/g, " ").trim();
  return single.length <= 80 ? single : `${single.slice(0, 80).trimEnd()}…`;
};

const getItems = (query: string): Item[] => {
  const pages = useJournalStore.getState().pages;
  const needle = query.trim().toLowerCase();

  const matched = pages.filter((page) => {
    if (page.archived) return false;
    if (!needle) return true;
    return (
      page.title.toLowerCase().includes(needle) ||
      page.content.toLowerCase().includes(needle) ||
      page.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
  });

  return [...matched]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((page) => ({
      id: page.id,
      label: page.title || "Untitled",
      workspace: page.workspace,
      preview: previewOf(page.content),
    }));
};

/** Replace the typed query with a journal reference chip. */
const activate: NonNullable<SuggestionOptions<Item, Item>["command"]> = ({
  editor,
  range,
  props,
}) => {
  if (editor.isDestroyed) return;
  editor
    .chain()
    .focus()
    .insertContentAt(range, [
      { type: "journalRef", attrs: { id: props.id } },
      { type: "text", text: " " },
    ])
    .run();
};

const renderSuggestion =
  (
    stateRef: PickerStateRef,
  ): NonNullable<SuggestionOptions<Item, Item>["render"]> =>
  () => {
    let component: ReactRenderer<
      JournalSuggestionListHandle,
      JournalSuggestionListProps
    > | null = null;
    let unmount: (() => void) | null = null;

    const listProps = (props: Props): JournalSuggestionListProps => ({
      items: props.items,
      command: props.command,
    });

    return {
      onStart: (props) => {
        stateRef.current = { active: true, count: props.items.length };
        component = new ReactRenderer<
          JournalSuggestionListHandle,
          JournalSuggestionListProps
        >(JournalSuggestionList, {
          props: listProps(props),
          editor: props.editor,
        });
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => {
        stateRef.current = { active: true, count: props.items.length };
        component?.updateProps(listProps(props));
      },
      onExit: () => {
        stateRef.current = { active: false, count: 0 };
        unmount?.();
        unmount = null;
        component?.destroy();
        component = null;
      },
      onKeyDown: (props) => component?.ref?.onKeyDown(props) ?? false,
    };
  };

/**
 * Inline "#" journal picker for the composer: typing "#" suggests journal
 * entries and inserts the chosen one as a reference chip. Only fires at a word
 * boundary so it never triggers inside a URL fragment or a token like `foo#bar`.
 */
export const createJournalSuggestion = (stateRef: PickerStateRef) =>
  Extension.create({
    name: "journalSuggestion",
    addProseMirrorPlugins() {
      return [
        Suggestion<Item, Item>({
          editor: this.editor,
          char: JOURNAL_SUGGESTION_CHAR,
          pluginKey,
          items: ({ query }) => getItems(query),
          command: activate,
          render: renderSuggestion(stateRef),
          allow: ({ state, range }) => {
            const before = state.doc.textBetween(
              Math.max(0, range.from - 1),
              range.from,
              undefined,
              "\ufffc",
            );
            return before === "" || /\s/.test(before);
          },
        }),
      ];
    },
  });
