import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  TagSuggestionList,
  type TagSuggestionItem,
  type TagSuggestionListHandle,
  type TagSuggestionListProps,
} from "@/components/journal/editor/tag/tag-suggestion-list";

export const TAG_SUGGESTION_CHAR = "@";

type Item = TagSuggestionItem;
type Props = SuggestionProps<Item, Item>;

const pluginKey = new PluginKey("tagSuggestion");

const getItems = (tags: string[], query: string): Item[] => {
  const needle = query.trim().toLowerCase();
  const matched = needle
    ? tags.filter((tag) => tag.toLowerCase().includes(needle))
    : tags;

  return matched.map((label) => ({ label }));
};

/**
 * Insert the chosen tag as plain text. The tag normalizer then marks it, so the
 * picker never has to touch document structure itself.
 */
const activate: NonNullable<SuggestionOptions<Item, Item>["command"]> = ({
  editor,
  range,
  props,
}) => {
  editor
    .chain()
    .focus()
    .insertContentAt(range, `${TAG_SUGGESTION_CHAR}${props.label} `)
    .run();
};

const renderSuggestion =
  (): NonNullable<SuggestionOptions<Item, Item>["render"]> => () => {
    let component: ReactRenderer<
      TagSuggestionListHandle,
      TagSuggestionListProps
    > | null = null;
    let unmount: (() => void) | null = null;

    const listProps = (props: Props): TagSuggestionListProps => ({
      items: props.items,
      command: props.command,
    });

    return {
      onStart: (props) => {
        component = new ReactRenderer<
          TagSuggestionListHandle,
          TagSuggestionListProps
        >(TagSuggestionList, {
          props: listProps(props),
          editor: props.editor,
        });
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => component?.updateProps(listProps(props)),
      onExit: () => {
        unmount?.();
        unmount = null;
        component?.destroy();
        component = null;
      },
      onKeyDown: (props) => component?.ref?.onKeyDown(props) ?? false,
    };
  };

/**
 * Inline "@" tag picker for the journal editor: typing "@" suggests existing
 * tags, and the chosen one is inserted as text (marked by the tag normalizer).
 *
 * `getTags` supplies the tag pool so the extension stays free of any store
 * dependency.
 */
export const createTagSuggestion = (getTags: () => string[]) =>
  Extension.create({
    name: "tagSuggestion",

    addProseMirrorPlugins() {
      return [
        Suggestion<Item, Item>({
          editor: this.editor,
          char: TAG_SUGGESTION_CHAR,
          pluginKey,
          items: ({ query }) => getItems(getTags(), query),
          command: activate,
          render: renderSuggestion(),
          // Only trigger where a tag can start (not inside emails/URLs), matching
          // the tag pattern's boundary rule.
          allow: ({ state, range }) => {
            const before = state.doc.textBetween(
              Math.max(0, range.from - 1),
              range.from,
              undefined,
              "\ufffc",
            );
            return before === "" || !/[\w@/]/.test(before);
          },
        }),
      ];
    },
  });
