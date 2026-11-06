import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/** `@` followed by one or more word characters. */
const TAG_REGEX = /@(\w+)/g;

interface TagState {
  decorations: DecorationSet;
  /** Unique tag names found in the document, without the leading `@`. */
  tags: string[];
}

/** Scan the document once for tags, deriving both the highlight and the names. */
const scanTags = (doc: PMNode): TagState => {
  const decorations: Decoration[] = [];
  const tags = new Set<string>();

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    for (const match of node.text.matchAll(TAG_REGEX)) {
      const start = pos + match.index;
      decorations.push(
        Decoration.inline(start, start + match[0].length, {
          class: "mention-highlight",
        }),
      );
      tags.add(match[1]);
    }
  });

  return {
    decorations: DecorationSet.create(doc, decorations),
    tags: [...tags].sort(),
  };
};

export const tagPluginKey = new PluginKey<TagState>("mentionHighlighter");

export const TagHighlighter = Extension.create({
  name: "tagHighlighter",

  addProseMirrorPlugins() {
    return [
      new Plugin<TagState>({
        key: tagPluginKey,
        state: {
          init: (_, { doc }) => scanTags(doc),
          apply: (tr, oldState) => (tr.docChanged ? scanTags(tr.doc) : oldState),
        },
        props: {
          decorations(state) {
            return tagPluginKey.getState(state)?.decorations;
          },
        },
      }),
    ];
  },
});
