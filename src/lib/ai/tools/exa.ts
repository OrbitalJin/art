import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const ExaTools = {
  web: "exa_search",
  news: "exa_news",
  fetch: "exa_fetch",
} as const;

export type ExaToolId = (typeof ExaTools)[keyof typeof ExaTools];

const EXA_SEARCH_URL = "https://api.exa.ai/search";
const EXA_CONTENTS_URL = "https://api.exa.ai/contents";

const DEFAULT_RESULTS = 6;
const DEFAULT_MAX_CHARACTERS = 8000;

export const exaResultSchema = z.object({
  title: z.string().nullable(),
  url: z.string().nullable(),
  publishedDate: z.string().nullable(),
  author: z.string().nullable(),
  text: z.string().nullable(),
});

export type ExaResult = z.infer<typeof exaResultSchema>;

export const exaSearchInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "Natural-language search query with the subject and any useful qualifiers.",
    ),
  numResults: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe("How many results to return. Defaults to 6."),
  includeDomains: z
    .array(z.string())
    .optional()
    .describe("Restrict results to these domains, e.g. ['arxiv.org']."),
});

export const exaNewsInputSchema = exaSearchInputSchema.extend({
  startPublishedDate: z
    .string()
    .optional()
    .describe(
      "Only return articles published on or after this ISO date (YYYY-MM-DD).",
    ),
});

export const exaFetchInputSchema = z.object({
  urls: z
    .array(z.string())
    .min(1)
    .max(10)
    .describe("Absolute URLs to fetch and extract the readable content from."),
  maxCharacters: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Cap the extracted text per page. Defaults to 8000."),
});

export const exaSearchOutputSchema = z.object({
  query: z.string(),
  results: z.array(exaResultSchema),
  error: z.string().optional(),
});

export const exaFetchOutputSchema = z.object({
  urls: z.array(z.string()),
  results: z.array(exaResultSchema),
  error: z.string().optional(),
});

export type ExaSearchOutput = z.infer<typeof exaSearchOutputSchema>;
export type ExaFetchOutput = z.infer<typeof exaFetchOutputSchema>;
export type ExaSearchInput = z.infer<typeof exaSearchInputSchema>;
export type ExaNewsInput = z.infer<typeof exaNewsInputSchema>;
export type ExaFetchInput = z.infer<typeof exaFetchInputSchema>;

interface ExaRawResult {
  title?: string | null;
  url?: string | null;
  publishedDate?: string | null;
  author?: string | null;
  text?: string | null;
  highlights?: unknown;
}

const asText = (result: ExaRawResult): string | null => {
  if (typeof result.text === "string" && result.text.trim()) return result.text;
  const highlights = Array.isArray(result.highlights)
    ? result.highlights.filter((h): h is string => typeof h === "string")
    : [];
  return highlights.length ? highlights.join("\n\n") : null;
};

const normalize = (result: ExaRawResult): ExaResult => ({
  title: result.title ?? null,
  url: result.url ?? null,
  publishedDate: result.publishedDate ?? null,
  author: result.author ?? null,
  text: asText(result),
});

const exaKey = (): string | null =>
  useSettingsStore.getState().keys?.exa?.trim() || null;

const noKeyError =
  "No Exa key configured. Ask the user to add one in Settings, then retry.";

interface ExaSearchBody {
  query: string;
  numResults: number;
  contents: { highlights: true };
  includeDomains?: string[];
  category?: string;
  startPublishedDate?: string;
}

const postExa = async (url: string, key: string, body: unknown) => {
  try {
    const response = await nativeFetch(url, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        error: `Exa request failed: ${response.status} ${response.statusText}${
          detail ? ` — ${detail.slice(0, 200)}` : ""
        }`,
      } as const;
    }

    return { data: (await response.json()) as { results?: ExaRawResult[] } };
  } catch (error) {
    return {
      error: `Exa request failed: ${String(error).slice(0, 200)}`,
    } as const;
  }
};

const runSearch = async (
  input: ExaSearchInput & { startPublishedDate?: string },
  category?: string,
): Promise<ExaSearchOutput> => {
  const key = exaKey();
  if (!key) return { query: input.query, results: [], error: noKeyError };

  const body: ExaSearchBody = {
    query: input.query,
    numResults: input.numResults ?? DEFAULT_RESULTS,
    contents: { highlights: true },
  };
  if (input.includeDomains?.length) body.includeDomains = input.includeDomains;
  if (category) body.category = category;
  if (input.startPublishedDate) {
    body.startPublishedDate = input.startPublishedDate;
  }

  const { data, error } = await postExa(EXA_SEARCH_URL, key, body);
  if (error || !data)
    return { query: input.query, results: [], error: error ?? undefined };

  return { query: input.query, results: (data.results ?? []).map(normalize) };
};

const searchDescription =
  "Search the web and get ranked results with page excerpts. `query` is the " +
  "natural-language search string. Results carry a title, URL, and an excerpt; " +
  "call `exa_fetch` on a URL when you need the full page text.";

const newsDescription =
  "Search recent news and get ranked articles with excerpts. `query` is the " +
  "search string; `startPublishedDate` (YYYY-MM-DD) limits recency. Use this " +
  "instead of `exa_search` when the user asks for news or recent events.";

const fetchDescription =
  "Fetch and extract the readable content of one or more pages. `urls` is the " +
  "list of absolute URLs (max 10). `maxCharacters` caps the extracted text per " +
  "page (defaults to 8000).";

const notAvailable = (): string =>
  "Exa search is unavailable. Ask the user to add an Exa key in Settings.";

export const searchTools = (): ToolSet => ({
  [ExaTools.web]: tool({
    title: "Web search",
    description: searchDescription,
    inputSchema: exaSearchInputSchema,
    outputSchema: exaSearchOutputSchema,
    execute: async (input: ExaSearchInput) => {
      if (!exaKey())
        return { query: input.query, results: [], error: notAvailable() };
      return runSearch(input);
    },
  }),

  [ExaTools.news]: tool({
    title: "News search",
    description: newsDescription,
    inputSchema: exaNewsInputSchema,
    outputSchema: exaSearchOutputSchema,
    execute: async (input: ExaNewsInput) => {
      if (!exaKey())
        return { query: input.query, results: [], error: notAvailable() };
      return runSearch(input, "news");
    },
  }),

  [ExaTools.fetch]: tool({
    title: "Fetch URL",
    description: fetchDescription,
    inputSchema: exaFetchInputSchema,
    outputSchema: exaFetchOutputSchema,
    execute: async ({
      urls,
      maxCharacters,
    }: ExaFetchInput): Promise<ExaFetchOutput> => {
      const key = exaKey();
      if (!key) return { urls, results: [], error: noKeyError };

      const { data, error } = await postExa(EXA_CONTENTS_URL, key, {
        urls,
        text: { maxCharacters: maxCharacters ?? DEFAULT_MAX_CHARACTERS },
      });
      if (error || !data)
        return { urls, results: [], error: error ?? undefined };

      return { urls, results: (data.results ?? []).map(normalize) };
    },
  }),
});
