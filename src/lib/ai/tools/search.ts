import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { tool, type ToolSet } from "ai";
import { z } from "zod";

const EXA_BASE = "https://api.exa.ai";

const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  text: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
});

const fetchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  text: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
});

const NO_KEY_ERROR =
  "Exa API key is not configured. Ask the user to add one in Settings > Chat.";

export const searchTools = (): ToolSet => {
  const getKey = () => useSettingsStore.getState().searchApiKey;

  return {
    web_search: tool({
      title: "Web Search",
      description:
        "Search the web for current information. Returns titles, URLs, and content snippets for relevant results.",
      inputSchema: z.object({
        query: z.string().describe("The search query"),
        numResults: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe("Number of results to return (default 5, max 10)"),
      }),
      outputSchema: z.object({
        results: z.array(searchResultSchema),
        costDollars: z.unknown().optional(),
        error: z.string().optional(),
      }),
      execute: async ({ query, numResults }) => {
        const apiKey = getKey();
        if (!apiKey) {
          return { results: [], error: NO_KEY_ERROR };
        }

        const res = await nativeFetch(`${EXA_BASE}/search`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            type: "auto",
            numResults: numResults ?? 5,
            contents: {
              text: { maxCharacters: 1000 },
              highlights: true,
            },
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return {
            results: [],
            error: `Exa search failed (${res.status}): ${detail.slice(0, 200)}`,
          };
        }

        const data = (await res.json()) as {
          results: z.infer<typeof searchResultSchema>[];
          costDollars?: unknown;
        };
        return {
          results: data.results ?? [],
          costDollars: data.costDollars,
        };
      },
    }),

    fetch_url: tool({
      title: "Fetch URL",
      description:
        "Fetch and read the content of a specific URL. Use this when you already have a URL and need its full text.",
      inputSchema: z.object({
        url: z.string().url().describe("The URL to fetch"),
      }),
      outputSchema: z.object({
        results: z.array(fetchResultSchema),
        costDollars: z.unknown().optional(),
        error: z.string().optional(),
      }),
      execute: async ({ url }) => {
        const apiKey = getKey();
        if (!apiKey) {
          return { results: [], error: NO_KEY_ERROR };
        }

        const res = await nativeFetch(`${EXA_BASE}/contents`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            urls: [url],
            text: { maxCharacters: 8000 },
            summary: true,
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return {
            results: [],
            error: `Exa contents failed (${res.status}): ${detail.slice(0, 200)}`,
          };
        }

        const data = (await res.json()) as {
          results: z.infer<typeof fetchResultSchema>[];
          costDollars?: unknown;
        };
        return {
          results: data.results ?? [],
          costDollars: data.costDollars,
        };
      },
    }),
  };
};
