export type {
  SlackChannel,
  SlackIdentity,
  SlackMessage,
  SlackUser,
} from "@/lib/ai/tools/slack";

/** Slack ids look like `C01234ABCDE`, `U…`, `G…`, `D…`, `W…`. */
export const looksLikeId = (value: string): boolean =>
  /^[CGDUW][A-Z0-9]{8,}$/.test(value);

/**
 * Turns Slack mrkdwn tokens into readable text: `<@U1>` -> `@U1`,
 * `<#C1|general>` -> `#general`, `<https://x|label>` -> `label`, and decodes
 * the three HTML entities Slack escapes.
 */
export const cleanSlackText = (text: string): string =>
  text
    .replace(
      /<@([A-Z0-9]+)(?:\|([^>]+))?>/g,
      (_match, id: string, label?: string) => `@${label ?? id}`,
    )
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
    .replace(/<#([A-Z0-9]+)>/g, "#$1")
    .replace(/<!(here|channel|everyone)[^>]*>/g, "@$1")
    .replace(/<(https?:[^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<(https?:[^>]+)>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** Gmail-style: time today, "Mar 4" this year, "Mar 4, 2024" otherwise. */
export const formatSlackTs = (value: string | null): string | null => {
  if (!value) return null;

  const seconds = Number.parseFloat(value);
  if (!Number.isFinite(seconds)) return null;

  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
