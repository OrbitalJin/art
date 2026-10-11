import { getSearchSession } from "@/lib/services/composio";
import { tool } from "ai";
import { z } from "zod";

const NO_SESSION_ERROR =
  "Web search is unavailable. Add a Composio key in Settings > Chat.";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const get = (value: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => asRecord(acc)?.[key], value);

const pickArray = (value: unknown, paths: string[]): unknown[] => {
  for (const path of paths) {
    const arr = asArray(get(value, path));
    if (arr.length > 0) return arr;
  }
  return [];
};

const compact = (input: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

/**
 * `session.execute` returns `{ data, error, logId }`; some tool payloads are
 * themselves wrapped as `{ data, error, successful }`. Unwrap defensively.
 */
const payloadOf = (data: unknown): unknown => {
  const record = asRecord(data);
  if (record && "data" in record && "successful" in record) {
    return record.data;
  }
  return data;
};

const normalizeResult = (item: unknown) => {
  const record = asRecord(item) ?? {};
  const url =
    asString(record.url) ?? asString(record.link) ?? asString(record.href);
  return {
    title:
      asString(record.title) ?? asString(record.name) ?? url ?? "Untitled",
    url: url ?? "",
    text:
      asString(record.text) ??
      asString(record.content) ??
      asString(record.snippet),
    summary: asString(record.summary),
    publishedDate:
      asString(record.publishedDate) ??
      asString(record.published_date) ??
      asString(record.date),
    author: asString(record.author),
  };
};

const TRAVEL_CLASS: Record<string, number> = {
  economy: 1,
  premium_economy: 2,
  business: 3,
  first: 4,
};

const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  text: z.string().optional(),
  summary: z.string().optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
});

const resultsOutputSchema = z.object({
  results: z.array(searchResultSchema),
  error: z.string().optional(),
});

const rawOutputSchema = z.object({
  data: z.unknown().optional(),
  error: z.string().optional(),
});

type ExecuteResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

const executeSlug = async (
  slug: string,
  args: Record<string, unknown>,
): Promise<ExecuteResult> => {
  const session = await getSearchSession();
  if (!session) return { ok: false, error: NO_SESSION_ERROR };
  try {
    const response = await session.execute(slug, args);
    if (response.error) return { ok: false, error: response.error };
    return { ok: true, data: response.data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const toResults = (
  result: ExecuteResult,
  paths: string[],
  limit?: number,
): { results: z.infer<typeof searchResultSchema>[]; error?: string } => {
  if (!result.ok) return { results: [], error: result.error };
  const results = pickArray(payloadOf(result.data), paths).map(normalizeResult);
  return {
    results: typeof limit === "number" ? results.slice(0, limit) : results,
  };
};

const toRaw = (result: ExecuteResult): { data?: unknown; error?: string } =>
  result.ok ? { data: result.data } : { error: result.error };

export const searchTools = () => {
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
      outputSchema: resultsOutputSchema,
      execute: async ({ query, numResults }) =>
        toResults(
          await executeSlug("COMPOSIO_SEARCH_WEB", { query }),
          [
            "results.citations",
            "results.organic_results",
            "citations",
            "organic_results",
            "results",
          ],
          numResults ?? 5,
        ),
    }),

    fetch_url: tool({
      title: "Fetch URL",
      description:
        "Fetch and read the content of a specific URL. Use this when you already have a URL and need its full text.",
      inputSchema: z.object({
        url: z.string().url().describe("The URL to fetch"),
      }),
      outputSchema: resultsOutputSchema,
      execute: async ({ url }) => {
        const result = await executeSlug("COMPOSIO_SEARCH_FETCH_URL_CONTENT", {
          urls: [url],
          text: true,
          summary: true,
          max_characters: 8000,
        });
        const mapped = toResults(result, ["results", "contents", "documents"]);
        if (!result.ok || mapped.results.length > 0) return mapped;

        const payload = payloadOf(result.data);
        const text =
          asString(get(payload, "text")) ?? asString(get(payload, "content"));
        if (text) return { results: [{ title: url, url, text }] };
        return mapped;
      },
    }),

    news_search: tool({
      title: "News Search",
      description:
        "Search recent news articles. Returns headlines, sources, dates, and links.",
      inputSchema: z.object({
        query: z.string().describe("The news search query"),
        when: z
          .enum(["d", "w", "m", "y"])
          .optional()
          .describe("Recency window: d=day, w=week, m=month, y=year"),
        numResults: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe("Number of results to return (default 5, max 20)"),
      }),
      outputSchema: resultsOutputSchema,
      execute: async ({ query, when, numResults }) =>
        toResults(
          await executeSlug(
            "COMPOSIO_SEARCH_NEWS",
            compact({ query, when }),
          ),
          ["results.news_results", "news_results", "results"],
          numResults ?? 5,
        ),
    }),

    flight_search: tool({
      title: "Flight Search",
      description:
        "Search for flights between two airports with schedules and pricing. " +
        "Use IATA airport codes (departure_id/arrival_id) and ISO dates " +
        "(outbound_date/return_date) — free-text city names often fail to " +
        "resolve. If you don't know a city's IATA code, look it up with " +
        "web_search first. Example: departure_id='CMN', arrival_id='MNL', " +
        "outbound_date='2026-11-15', return_date='2026-11-29', " +
        "travel_class='economy'.",
      inputSchema: z.object({
        departure_id: z
          .string()
          .optional()
          .describe(
            "Origin airport IATA code, e.g. 'CMN'. Preferred over free text.",
          ),
        arrival_id: z
          .string()
          .optional()
          .describe(
            "Destination airport IATA code, e.g. 'MNL'. Preferred over free text.",
          ),
        outbound_date: z
          .string()
          .optional()
          .describe("Departure date in YYYY-MM-DD."),
        return_date: z
          .string()
          .optional()
          .describe(
            "Return date in YYYY-MM-DD for round trips; omit for one-way.",
          ),
        travel_class: z
          .enum(["economy", "premium_economy", "business", "first"])
          .optional(),
        adults: z.number().int().min(1).optional(),
        children: z.number().int().min(0).optional(),
        infants: z.number().int().min(0).optional(),
        currency: z
          .string()
          .optional()
          .describe("3-letter currency code, e.g. 'USD'."),
        query: z
          .string()
          .optional()
          .describe(
            "Natural-language fallback; use only when IATA codes are unavailable.",
          ),
      }),
      outputSchema: rawOutputSchema,
      execute: async ({
        departure_id,
        arrival_id,
        outbound_date,
        return_date,
        travel_class,
        query,
        ...rest
      }) => {
        if (!query && (!departure_id || !arrival_id)) {
          return {
            error:
              "Provide departure_id and arrival_id (IATA codes) or a query. " +
              "If you don't know the IATA codes, look them up with web_search " +
              "first.",
          };
        }

        const result = await executeSlug(
          "COMPOSIO_SEARCH_FLIGHTS",
          compact({
            departure_id,
            arrival_id,
            outbound_date,
            return_date,
            travel_class: travel_class ? TRAVEL_CLASS[travel_class] : undefined,
            query,
            ...rest,
          }),
        );

        if (
          !result.ok &&
          /departure airport|arrival airport|IATA/i.test(result.error)
        ) {
          return {
            error:
              `${result.error} Resolve the city to an IATA code (e.g. with ` +
              "web_search) and retry using departure_id/arrival_id.",
          };
        }

        return toRaw(result);
      },
    }),

    hotel_search: tool({
      title: "Hotel Search",
      description:
        "Search for hotels and vacation rentals with prices, ratings, and availability.",
      inputSchema: z.object({
        q: z.string().describe("Location or hotel name, e.g. 'Paris'"),
        check_in_date: z.string().describe("Check-in date (YYYY-MM-DD)"),
        check_out_date: z.string().describe("Check-out date (YYYY-MM-DD)"),
        adults: z.number().int().min(1).optional(),
        children: z.number().int().min(0).optional(),
        min_price: z.number().int().optional(),
        max_price: z.number().int().optional(),
        currency: z.string().optional(),
      }),
      outputSchema: rawOutputSchema,
      execute: async ({ q, check_in_date, check_out_date, ...rest }) =>
        toRaw(
          await executeSlug(
            "COMPOSIO_SEARCH_HOTELS",
            compact({ q, check_in_date, check_out_date, ...rest }),
          ),
        ),
    }),

    maps_search: tool({
      title: "Places Search",
      description:
        "Search for places, businesses, and locations with details like ratings and opening hours.",
      inputSchema: z.object({
        q: z
          .string()
          .describe(
            "What to search for, including location, e.g. 'pizza downtown Chicago'",
          ),
        ll: z
          .string()
          .optional()
          .describe("Optional GPS viewport as '@lat,lng,zoom'"),
      }),
      outputSchema: rawOutputSchema,
      execute: async ({ q, ll }) =>
        toRaw(
          await executeSlug("COMPOSIO_SEARCH_GOOGLE_MAPS", compact({ q, ll })),
        ),
    }),
  };
};

export type SearchToolName = keyof ReturnType<typeof searchTools>;
