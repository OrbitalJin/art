// Rough word count for a tiptap HTML string. Tags are stripped, entities are
// collapsed to whitespace, then the remainder is split on whitespace runs.
export const countWords = (html: string): number => {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .trim();

  return text === "" ? 0 : text.split(/\s+/).length;
};
