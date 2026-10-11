import type { ToolCallBlock } from "@/lib/store/session/types";

export const formatToolName = (name: string): string => {
  const withSpaces = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const pluralOf = (word: string): string => {
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
};

export const formatCount = (
  value: number,
  singular: string,
  plural = pluralOf(singular),
): string => `${value.toLocaleString()} ${value === 1 ? singular : plural}`;

export const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const recordsOf = (value: unknown): Record<string, unknown>[] =>
  asArray(value)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== null);

export const stringsOf = (value: unknown): string[] =>
  asArray(value).filter((item): item is string => typeof item === "string");

export const getString = (
  source: Record<string, unknown> | null,
  key: string,
): string | null => {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value : null;
};

export const getNumber = (
  source: Record<string, unknown> | null,
  key: string,
): number | null => {
  const value = source?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export const getBoolean = (
  source: Record<string, unknown> | null,
  key: string,
): boolean | null => {
  const value = source?.[key];
  return typeof value === "boolean" ? value : null;
};

export const errorOf = (output: unknown): string | null =>
  getString(asRecord(output), "error");

/**
 * The error to show for a block: an `error` field on the output, or a plain
 * string output when the block itself is in the error state.
 */
export const blockErrorOf = (block: ToolCallBlock): string | null => {
  const fromOutput = errorOf(block.output);
  if (fromOutput) return fromOutput;

  if (
    block.state === "error" &&
    typeof block.output === "string" &&
    block.output.trim()
  ) {
    return block.output;
  }

  return null;
};

/**
 * Composio tools return `{ data, error, successful }`. Unwrap `data` when
 * present and fall back to the raw value for defensiveness.
 */
export const dataOf = (output: unknown): unknown => {
  const record = asRecord(output);
  if (!record) return output;
  return "data" in record ? record.data : output;
};

export const formatValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

export const getSummaryText = (input: unknown): string | null => {
  const record = asRecord(input);
  if (!record) return null;

  const candidateKeys = [
    "summary",
    "query",
    "path",
    "file_path",
    "command",
    "pattern",
    "url",
    "title",
    "name",
    "id",
  ];

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

export const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

export const hostnameOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Gmail-style: time today, "Mar 4" this year, "Mar 4, 2024" otherwise. */
export const formatDate = (date: Date, now: Date = new Date()): string => {
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

export const formatDateTime = (date: Date): string =>
  date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
};

export const countLines = (text: string): number => {
  if (text.length === 0) return 0;
  const trimmed = text.endsWith("\n") ? text.slice(0, -1) : text;
  return trimmed.split("\n").length;
};

const EXTENSION_LANGUAGES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  zig: "zig",
  lua: "lua",
  r: "r",
  css: "css",
  scss: "scss",
  less: "less",
  html: "html",
  htm: "html",
  xml: "xml",
  svg: "xml",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  ini: "ini",
  md: "markdown",
  markdown: "markdown",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  sql: "sql",
  dockerfile: "docker",
};

export const languageForPath = (path: string): string => {
  const name = basename(path).toLowerCase();
  if (name === "dockerfile") return "docker";
  const ext = name.includes(".") ? (name.split(".").pop() ?? "") : "";
  return EXTENSION_LANGUAGES[ext] ?? "text";
};
