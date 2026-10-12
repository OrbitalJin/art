/**
 * Shared coercion helpers for reading unknown JSON payloads.
 *
 * External service payloads (Composio, transcripts, etc.) are untrusted and
 * loosely typed. These helpers give every reader the same, predictable way to
 * narrow a value without duplicating `typeof` checks across tool mappings and
 * renderers.
 */

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asRecord = (
  value: unknown,
): Record<string, unknown> | null => (isRecord(value) ? value : null);

export const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

export const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const asBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;

export const recordsOf = (value: unknown): Record<string, unknown>[] =>
  asArray(value)
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item !== null);

export const stringsOf = (value: unknown): string[] =>
  asArray(value).filter((item): item is string => typeof item === "string");

export const getString = (
  source: Record<string, unknown> | null | undefined,
  key: string,
): string | null => asString(source?.[key]);

export const getNumber = (
  source: Record<string, unknown> | null | undefined,
  key: string,
): number | null => asNumber(source?.[key]);

export const getBoolean = (
  source: Record<string, unknown> | null | undefined,
  key: string,
): boolean | null => asBoolean(source?.[key]);

/** First present, non-empty string among `keys`. */
export const firstString = (
  source: Record<string, unknown> | null | undefined,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = getString(source, key);
    if (value) return value;
  }
  return null;
};

/** First present, finite number among `keys`. */
export const firstNumber = (
  source: Record<string, unknown> | null | undefined,
  keys: string[],
): number | null => {
  for (const key of keys) {
    const value = getNumber(source, key);
    if (value !== null) return value;
  }
  return null;
};

/** Drop `undefined` values so optional arguments are omitted from payloads. */
export const compact = (
  input: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
