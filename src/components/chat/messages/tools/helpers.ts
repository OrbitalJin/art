export const formatToolName = (name: string): string => {
  const withSpaces = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const formatCount = (
  value: number,
  singular: string,
  plural = `${singular}s`,
): string => `${value.toLocaleString()} ${value === 1 ? singular : plural}`;

export const asRecord = (
  value: unknown,
): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

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

export const countLines = (text: string): number =>
  text.length === 0 ? 0 : text.split("\n").length;

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
  const ext = name.includes(".") ? name.split(".").pop() ?? "" : "";
  return EXTENSION_LANGUAGES[ext] ?? "text";
};
