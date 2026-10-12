const PLACEHOLDER_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;

export const extractPlaceholders = (content: string): string[] => {
  const names: string[] = [];
  for (const match of content.matchAll(PLACEHOLDER_RE)) {
    const name = match[1];
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
};

export const hasPlaceholders = (content: string): boolean =>
  extractPlaceholders(content).length > 0;

export const fillPlaceholders = (
  content: string,
  values: Record<string, string>,
): string =>
  content.replace(PLACEHOLDER_RE, (full, name: string) => {
    const value = values[name];
    return value !== undefined && value !== "" ? value : full;
  });
