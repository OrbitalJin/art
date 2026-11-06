import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  useStashStore,
  type StashEntry,
  type StashKind,
} from "@/lib/store/use-stash-store";
import { useStashUiStore } from "@/lib/store/use-stash-ui-store";
import { hasPlaceholders } from "@/lib/stash/placeholders";
import { inlineFromText } from "../text-content";
import {
  StashSuggestionList,
  type StashSuggestionListHandle,
  type StashSuggestionListProps,
} from "./stash-suggestion-list";

/** A stash entry offered by the inline "@" picker. */
export interface StashSuggestionItem {
  id: string;
  label: string;
  preview: string;
  kind: StashKind;
}

/**
 * Live state of the stash picker, readable from the composer's key handler so
 * Enter is reserved for the picker only when it can actually select something.
 */
export interface StashPickerState {
  active: boolean;
  count: number;
}

type PickerStateRef = { current: StashPickerState };
type Item = StashSuggestionItem;
type Props = SuggestionProps<Item, Item>;

export const STASH_SUGGESTION_CHAR = "@";

const pluginKey = new PluginKey("stashSuggestion");

const findEntry = (id: string): StashEntry | undefined =>
  useStashStore.getState().entries.find((entry) => entry.id === id);

const previewOf = (content: string): string => {
  const single = content.replace(/\s+/g, " ").trim();
  return single.length <= 80 ? single : `${single.slice(0, 80).trimEnd()}…`;
};

const toItem = (entry: StashEntry): Item => ({
  id: entry.id,
  label: entry.title || "Untitled",
  preview: previewOf(entry.content),
  kind: entry.kind,
});

const getItems = (query: string): Item[] => {
  const entries = useStashStore.getState().entries;
  const needle = query.trim().toLowerCase();
  const matched = needle
    ? entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(needle) ||
          entry.content.toLowerCase().includes(needle),
      )
    : entries;

  return [...matched].sort((a, b) => b.updatedAt - a.updatedAt).map(toItem);
};

/** Inject the selected entry: templates with placeholders open the fill dialog. */
const activate: NonNullable<
  SuggestionOptions<Item, Item>["command"]
> = ({ editor, range, props }) => {
  if (editor.isDestroyed) return;

  const entry = findEntry(props.id);

  if (!entry || (entry.kind === "template" && hasPlaceholders(entry.content))) {
    editor.chain().focus().deleteRange(range).run();
    if (entry) useStashUiStore.getState().openTemplate(entry);
    return;
  }

  const nodes = inlineFromText(entry.content);
  const chain = editor.chain().focus();
  if (nodes.length === 0) chain.deleteRange(range).run();
  else chain.insertContentAt(range, nodes).run();
};

const renderSuggestion = (
  stateRef: PickerStateRef,
): NonNullable<SuggestionOptions<Item, Item>["render"]> => () => {
  let component: ReactRenderer<
    StashSuggestionListHandle,
    StashSuggestionListProps
  > | null = null;
  let unmount: (() => void) | null = null;
  let latest: Props | null = null;

  const consumeQuery = () => {
    if (!latest || latest.editor.isDestroyed) return;
    latest.editor.chain().focus().deleteRange(latest.range).run();
  };

  const handleEdit = (item: Item) => {
    const entry = findEntry(item.id);
    consumeQuery();
    if (entry) useStashUiStore.getState().openEdit(entry);
  };

  const handleDelete = (item: Item) => {
    const entry = findEntry(item.id);
    consumeQuery();
    if (entry) useStashUiStore.getState().requestDelete(entry);
  };

  const listProps = (props: Props): StashSuggestionListProps => ({
    items: props.items,
    command: props.command,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return {
    onStart: (props) => {
      latest = props;
      stateRef.current = { active: true, count: props.items.length };
      component = new ReactRenderer<
        StashSuggestionListHandle,
        StashSuggestionListProps
      >(StashSuggestionList, {
        props: listProps(props),
        editor: props.editor,
      });
      unmount = props.mount(component.element);
    },
    onUpdate: (props) => {
      latest = props;
      stateRef.current = { active: true, count: props.items.length };
      component?.updateProps(listProps(props));
    },
    onExit: () => {
      latest = null;
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
 * Inline stash picker for the composer: typing "@" suggests saved prompts,
 * inserts the chosen snippet in place, and routes templates through the fill
 * dialog. Edit/delete/new actions open the shared stash dialogs.
 */
export const createStashSuggestion = (stateRef: PickerStateRef) =>
  Extension.create({
    name: "stashSuggestion",
    addProseMirrorPlugins() {
      return [
        Suggestion<Item, Item>({
          editor: this.editor,
          char: STASH_SUGGESTION_CHAR,
          pluginKey,
          items: ({ query }) => getItems(query),
          command: activate,
          render: renderSuggestion(stateRef),
        }),
      ];
    },
  });
