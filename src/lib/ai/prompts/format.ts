export interface JournalContextEntry {
  id: string;
  title: string;
  content: string;
}

const EXCERPT_LIMIT = 240;

const excerpt = (content: string): string => {
  const single = content.replace(/\s+/g, " ").trim();
  return single.length <= EXCERPT_LIMIT
    ? single
    : `${single.slice(0, EXCERPT_LIMIT).trimEnd()}…`;
};

export const format = {
  /**
   * Pointer + excerpt block for journal references. The agent reads the full
   * entry on demand with `journal_read`, so the reference itself stays cheap.
   */
  journalRefs: (entries: JournalContextEntry[]): string => {
    if (entries.length === 0) return "";

    const body = entries
      .map(
        (entry) =>
          `- [${entry.id}] ${entry.title} — ${excerpt(entry.content) || "(empty)"}`,
      )
      .join("\n");

    return (
      `\n<referenced_journal>\n${body}\n` +
      `(Call journal_read with an id for the full entry.)\n</referenced_journal>\n`
    );
  },
};
