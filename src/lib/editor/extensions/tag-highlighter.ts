import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const TagHighlighter = Extension.create({
  name: "tagHighlighter",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("mentionHighlighter"),
        state: {
          init(_, { doc }) {
            return findMentions(doc);
          },
          apply(tr, oldState) {
            return tr.docChanged ? findMentions(tr.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function findMentions(doc: any) {
  const decorations: Decoration[] = [];
  // Regex: matches @ followed by alphanumeric characters
  const mentionRegex = /@\w+/g;

  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      let match;
      while ((match = mentionRegex.exec(node.text))) {
        const start = pos + match.index;
        const end = start + match[0].length;

        decorations.push(
          Decoration.inline(start, end, {
            class: "mention-highlight",
          }),
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}
