export const senderName = (sender: string): string => {
  const match = sender.match(/^\s*"?([^"<]*?)"?\s*<[^>]+>\s*$/);
  return match?.[1]?.trim() || sender;
};
