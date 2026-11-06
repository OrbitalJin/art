import type { JSONContent } from "@tiptap/core";

/** Matches a reference token and captures it during `split`. */
const JOURNAL_TOKEN_RE = /(\[\[journal:[^\][]+]\])/g;
const TOKEN_ID_RE = /^\[\[journal:([^\][]+)\]\]$/;

/**
 * Build inline nodes for a plain-text string, mapping "\n" to hard breaks and
 * turning journal reference tokens back into chips so a draft survives a
 * round-trip through the string value (session switch, restored prompts).
 */
export const inlineFromText = (text: string): JSONContent[] => {
  const nodes: JSONContent[] = [];

  text.split("\n").forEach((line, index) => {
    if (index > 0) nodes.push({ type: "hardBreak" });
    if (!line.length) return;

    for (const chunk of line.split(JOURNAL_TOKEN_RE)) {
      if (!chunk) continue;
      const match = chunk.match(TOKEN_ID_RE);
      if (match) {
        nodes.push({ type: "journalRef", attrs: { id: match[1] } });
      } else {
        nodes.push({ type: "text", text: chunk });
      }
    }
  });

  return nodes;
};

export const docFromText = (text: string): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph", content: inlineFromText(text) }],
});
