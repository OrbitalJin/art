import { Node, mergeAttributes } from "@tiptap/core";
import { journalRefToken } from "@/lib/journal/ref";
import { useJournalIndex } from "@/lib/store/journal/index-store";

/**
 * Inline chip for a journal reference in the composer.
 *
 * The composer's value pipeline is plain text, so the node serializes back to
 * its bracket token via `renderText` (picked up by `editor.getText()`), and
 * `docFromText` turns the token back into a node. The title is read from the
 * store at render time — the id is the only stored state.
 */
export const JournalRefNode = Node.create({
  name: "journalRef",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-journal-ref]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const title = useJournalIndex.getState().getPage(node.attrs.id)?.title;
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "journal-ref-chip",
        "data-journal-ref": node.attrs.id,
      }),
      `#${title || "entry"}`,
    ];
  },

  renderText({ node }) {
    return journalRefToken(node.attrs.id);
  },
});
