/**
 * Journal references let the user point the agent at a specific entry.
 *
 * The composer's value pipeline is plain text (`onChange(editor.getText())`),
 * so a reference is encoded inline as a bracket token. The token is
 * deliberately not Markdown — no `#`, `_`, or `*` — so a sent message can never
 * render it as a heading or emphasis.
 */
export interface JournalRef {
  id: string;
  title: string;
}

const TOKEN_PREFIX = "[[journal:";
const TOKEN_SUFFIX = "]]";

const TOKEN_RE = /\[\[journal:([^\][]+)\]\]/g;

/** The inline token for a referenced entry id. */
export const journalRefToken = (id: string): string =>
  `${TOKEN_PREFIX}${id}${TOKEN_SUFFIX}`;

/** Distinct referenced ids, in order of first appearance. */
export const parseJournalRefIds = (text: string): string[] => {
  const ids: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    const id = match[1]?.trim();
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
};

/** Remove reference tokens, leaving the readable message text behind. */
export const stripJournalRefs = (text: string): string =>
  text.replace(TOKEN_RE, " ").replace(/[ \t]{2,}/g, " ").trim();
