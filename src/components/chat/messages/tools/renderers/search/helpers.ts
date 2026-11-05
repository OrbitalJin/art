import { formatDate } from "../../shared";

export type { SearchResult as WebResult } from "./schema";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Gmail-style date. Date-only values never show a time of day. */
export const formatResultDate = (value: string | null): string | null => {
  if (!value) return null;

  const dateOnly = DATE_ONLY.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;

  if (!dateOnly) return formatDate(date);

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

export const wordCountOf = (text: string): number =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
