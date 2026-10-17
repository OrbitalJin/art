import { formatDate } from "../../shared";

export type {
  FlightOption,
  FlightSegment,
  Hotel,
  Layover,
  Place,
  SearchResult as WebResult,
} from "./schema";

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

export const clipText = (text: string, limit: number): string =>
  text.length > limit ? `${text.slice(0, limit)}…` : text;

export const lowestOf = (values: (number | null)[]): number | null => {
  const present = values.filter((value): value is number => value !== null);
  return present.length > 0 ? Math.min(...present) : null;
};

/** 90 -> `1h 30m`, 820 -> `13h 40m`, 45 -> `45m`. */
export const formatDuration = (minutes: number | null): string | null => {
  if (minutes === null || minutes < 0) return null;

  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatMoney = (
  amount: number | null,
  currency: string | null,
): string | null => {
  if (amount === null) return null;

  const code = currency?.trim();

  if (code) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Unknown currency code — fall through to a plain number.
    }
  }

  return amount.toLocaleString();
};
