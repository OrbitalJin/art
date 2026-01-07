export const extractTags = (content: string): string[] => {
  const tagRegex = /@(\w+)/g;
  const matches = content.matchAll(tagRegex);
  const uniqueTags = new Set(
    Array.from(matches, (match) => match[1].toLowerCase()),
  );
  return Array.from(uniqueTags).filter(Boolean);
};

export const parseAndUpdateTags = (
  content: string,
  existingTags: string[],
): string[] => {
  const extractedTags = extractTags(content);
  const combinedTags = [...new Set([...existingTags, ...extractedTags])];
  return combinedTags.sort();
};
