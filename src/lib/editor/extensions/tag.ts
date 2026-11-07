import { Mark } from "@tiptap/core";
import type { MarkType, Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";

export const TAG_MARK_NAME = "tag";

/**
 * A tag is `@` followed by a letter, then letters/digits/underscore/hyphen.
 * The negative lookbehind skips `@` inside emails (`a@b`) and URL paths
 * (`example.com/@user`); `u` makes the classes unicode-aware.
 */
export const TAG_PATTERN = /(?<![\w@/])@(\p{L}[\p{L}\p{N}_-]*)/gu;

interface TagRange {
  from: number;
  to: number;
}

interface TextSpan {
  /** Offset of this span within the concatenated block text. */
  start: number;
  /** Absolute document position of the span's first character. */
  pos: number;
  len: number;
  code: boolean;
}

/** Tag ranges within a single textblock, mapped back to document positions. */
const scanBlock = (block: PMNode, blockPos: number): TagRange[] => {
  const spans: TextSpan[] = [];
  let text = "";

  // Concatenate the block's inline text so tags split across marks (which
  // split text nodes) are still matched as one token.
  block.forEach((child, offset) => {
    if (child.isText && child.text) {
      spans.push({
        start: text.length,
        pos: blockPos + 1 + offset,
        len: child.text.length,
        code: child.marks.some((mark) => mark.type.name === "code"),
      });
      text += child.text;
    } else {
      // Keep tokens from merging across inline atoms (images, hard breaks).
      text += " ";
    }
  });

  const ranges: TagRange[] = [];
  for (const match of text.matchAll(TAG_PATTERN)) {
    const start = match.index;
    const end = start + match[0].length;
    const span = spans.find((s) => start >= s.start && end <= s.start + s.len);
    if (!span || span.code) continue;
    ranges.push({
      from: span.pos + (start - span.start),
      to: span.pos + (end - span.start),
    });
  }

  return ranges;
};

/** Every `@tag` range in the document, skipping code blocks and inline code. */
const collectRanges = (doc: PMNode): TagRange[] => {
  const ranges: TagRange[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock || node.type.name === "codeBlock") return;
    ranges.push(...scanBlock(node, pos));
    return false;
  });
  return ranges;
};

/** Ranges that currently carry the tag mark. */
const markedRanges = (doc: PMNode, mark: MarkType): TagRange[] => {
  const ranges: TagRange[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.marks.some((m) => m.type.name === mark.name)) {
      ranges.push({ from: pos, to: pos + node.nodeSize });
    }
  });
  return ranges;
};

/**
 * Rewrite the transaction so the tag mark covers exactly the scanned tags.
 * Returns false when nothing needs to change, which is what stops the
 * append-transaction loop after the marks are in place.
 */
const applyMarks = (tr: Transaction, mark: MarkType): boolean => {
  const desired = collectRanges(tr.doc);
  const existing = markedRanges(tr.doc, mark);

  const sameRange = (a: TagRange, b: TagRange) => a.from === b.from && a.to === b.to;
  const toRemove = existing.filter((r) => !desired.some((d) => sameRange(d, r)));
  const toAdd = desired.filter((d) => !existing.some((r) => sameRange(r, d)));

  if (toRemove.length === 0 && toAdd.length === 0) return false;

  for (const range of toRemove) tr.removeMark(range.from, range.to, mark);
  const instance = mark.create();
  for (const range of toAdd) tr.addMark(range.from, range.to, instance);
  return true;
};

const normalizerKey = new PluginKey("tagNormalizer");

export const Tag = Mark.create({
  name: TAG_MARK_NAME,

  // Typing at the edge of a tag must not extend the mark into new text.
  inclusive: false,

  parseHTML() {
    return [{ tag: "span.mention-highlight" }];
  },

  renderHTML() {
    return ["span", { class: "mention-highlight" }, 0];
  },

  addStorage() {
    return {
      markdown: {
        // Tags are plain "@name" text in markdown; the mark only adds editor
        // styling, so it serializes to nothing and leaves content untouched.
        serialize: { open: () => "", close: () => "" },
        parse: {},
      },
    };
  },

  // Apply the marks to content that arrived already-tagged (e.g. a note opened
  // from disk). The normalizer below only runs on doc-changing transactions,
  // and creating an editor with content emits none, so without this the tags
  // render unstyled until the first edit. Marked no-history no-update so this
  // is not treated as an edit (no undo entry, no save).
  onCreate() {
    const mark = this.type;
    const tr = this.editor.state.tr;
    if (!applyMarks(tr, mark)) return;
    tr.setMeta("addToHistory", false);
    tr.setMeta("preventUpdate", true);
    this.editor.view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    const mark = this.type;
    return [
      new Plugin({
        key: normalizerKey,
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const tr = newState.tr;
          if (!applyMarks(tr, mark)) return null;

          tr.setMeta("addToHistory", false);
          return tr;
        },
      }),
    ];
  },
});

/** Unique tag names present in a document, without the leading `@`. */
export const collectTags = (doc: PMNode): string[] => {
  const tags = new Set<string>();
  doc.descendants((node) => {
    if (!node.isText || !node.text) return;
    if (!node.marks.some((m) => m.type.name === TAG_MARK_NAME)) return;

    for (const match of node.text.matchAll(TAG_PATTERN)) tags.add(match[1]);
  });
  return [...tags].sort();
};
