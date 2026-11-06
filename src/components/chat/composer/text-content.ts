import type { JSONContent } from "@tiptap/core";

/** Build inline nodes for a plain-text string, mapping "\n" to hard breaks. */
export const inlineFromText = (text: string): JSONContent[] => {
  const nodes: JSONContent[] = [];
  text.split("\n").forEach((line, index) => {
    if (index > 0) nodes.push({ type: "hardBreak" });
    if (line.length) nodes.push({ type: "text", text: line });
  });
  return nodes;
};

export const docFromText = (text: string): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph", content: inlineFromText(text) }],
});
