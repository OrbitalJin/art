import { z } from "zod";
import { ensureSearchSession } from "@/lib/services/composio";
import { composioTool } from "./composio/define";
import { failed } from "./composio/output";
import {
  asArray,
  asRecord,
  asString,
  compact,
  firstString,
  getNumber,
  getString,
  recordsOf,
  stringsOf,
} from "@/lib/utils/coerce";

/**
 * Search tools backed by Composio's no-auth search toolkit. Each tool
 * normalizes the (deeply nested) Composio payload into a clean, renderable
 * schema so the UI never walks raw envelopes.
 */

export const searchResultSchema = z.object({
  title: z.string().nullable(),
  url: z.string().nullable(),
  snippet: z.string().nullable(),
  text: z.string().nullable(),
  date: z.string().nullable(),
  author: z.string().nullable(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export const flightSegmentSchema = z.object({
  airline: z.string().nullable(),
  flightNumber: z.string().nullable(),
  airplane: z.string().nullable(),
  travelClass: z.string().nullable(),
  departureId: z.string().nullable(),
  departureName: z.string().nullable(),
  departureAt: z.string().nullable(),
  departureTime: z.string().nullable(),
  arrivalId: z.string().nullable(),
  arrivalName: z.string().nullable(),
  arrivalAt: z.string().nullable(),
  arrivalTime: z.string().nullable(),
  duration: z.number().nullable(),
});

export type FlightSegment = z.infer<typeof flightSegmentSchema>;

export const layoverSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  duration: z.number().nullable(),
  overnight: z.boolean(),
});

export type Layover = z.infer<typeof layoverSchema>;

export const flightOptionSchema = z.object({
  airline: z.string().nullable(),
  price: z.number().nullable(),
  type: z.string().nullable(),
  totalDuration: z.number().nullable(),
  dayOffset: z.number(),
  segments: z.array(flightSegmentSchema),
  layovers: z.array(layoverSchema),
  extensions: z.array(z.string()),
});

export type FlightOption = z.infer<typeof flightOptionSchema>;

export const hotelSchema = z.object({
  name: z.string().nullable(),
  link: z.string().nullable(),
  token: z.string().nullable(),
  rating: z.number().nullable(),
  reviews: z.number().nullable(),
  hotelClass: z.string().nullable(),
  pricePerNight: z.number().nullable(),
  priceLabel: z.string().nullable(),
  totalPrice: z.number().nullable(),
  description: z.string().nullable(),
  amenities: z.array(z.string()),
});

export type Hotel = z.infer<typeof hotelSchema>;

export const placeSchema = z.object({
  title: z.string().nullable(),
  type: z.string().nullable(),
  types: z.array(z.string()),
  address: z.string().nullable(),
  rating: z.number().nullable(),
  reviews: z.number().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  openState: z.string().nullable(),
});

export type Place = z.infer<typeof placeSchema>;

export const resultsOutput = z.object({
  results: z.array(searchResultSchema),
  error: z.string().optional(),
});

export const flightsOutput = z.object({
  best: z.array(flightOptionSchema),
  other: z.array(flightOptionSchema),
  currency: z.string().nullable(),
  error: z.string().optional(),
});

export const hotelsOutput = z.object({
  hotels: z.array(hotelSchema),
  currency: z.string().nullable(),
  error: z.string().optional(),
});

export const placesOutput = z.object({
  places: z.array(placeSchema),
  single: z.boolean(),
  error: z.string().optional(),
});

export type ResultsOutput = z.infer<typeof resultsOutput>;
export type FlightsOutput = z.infer<typeof flightsOutput>;
export type HotelsOutput = z.infer<typeof hotelsOutput>;
export type PlacesOutput = z.infer<typeof placesOutput>;

/* Envelope walking ---------------------------------------------------------- */

/** Parses a JSON string when the value looks like an object or array. */
const parseJsonValue = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
};

/**
 * Travel and places payloads arrive nested inside an unknown number of
 * `{ data, successful }` / `results` envelopes. Rather than hardcode a depth,
 * walk the tree for the first non-null value at `key`.
 */
const findValue = (input: unknown, key: string, depth = 0): unknown => {
  if (depth > 8) return undefined;

  const value = parseJsonValue(input);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findValue(item, key, depth + 1);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  const record = asRecord(value);
  if (!record) return undefined;

  if (record[key] !== undefined && record[key] !== null) return record[key];

  for (const item of Object.values(record)) {
    const found = findValue(item, key, depth + 1);
    if (found !== undefined) return found;
  }

  return undefined;
};

const firstRecords = (
  output: unknown,
  keys: string[],
): Record<string, unknown>[] => {
  for (const key of keys) {
    const records = recordsOf(findValue(output, key));
    if (records.length > 0) return records;
  }
  return [];
};

const firstRecord = (
  output: unknown,
  keys: string[],
): Record<string, unknown> | null => {
  for (const key of keys) {
    const record = asRecord(findValue(output, key));
    if (record) return record;
  }
  return null;
};

const getPath = (value: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => asRecord(acc)?.[key], value);

const pickArray = (value: unknown, paths: string[]): unknown[] => {
  for (const path of paths) {
    const arr = asArray(getPath(value, path));
    if (arr.length > 0) return arr;
  }
  return [];
};

/* Results ------------------------------------------------------------------- */

const toSearchResult = (item: unknown): SearchResult => {
  const record = asRecord(item) ?? {};
  const highlight = stringsOf(record.highlights)[0] ?? null;
  const url =
    getString(record, "url") ?? getString(record, "link") ?? getString(record, "href");

  return {
    title:
      getString(record, "title") ?? getString(record, "name") ?? url,
    url,
    snippet:
      getString(record, "summary") ??
      getString(record, "text") ??
      getString(record, "snippet") ??
      highlight,
    text: getString(record, "text") ?? getString(record, "content"),
    date:
      getString(record, "publishedDate") ??
      getString(record, "published_date") ??
      getString(record, "date"),
    author: getString(record, "author"),
  };
};

const toResults = (data: Record<string, unknown>, paths: string[]): SearchResult[] =>
  pickArray(data, paths).map(toSearchResult);

/* Flights ------------------------------------------------------------------- */

/** `"2026-03-03 10:10"` / `"2026-03-03T10:10"` -> `"10:10"`. */
const timeOf = (value: string | null): string | null => {
  if (!value) return null;
  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
};

/** Days since epoch for the `YYYY-MM-DD` part of a timestamp. */
const dayOf = (value: string | null): number | null => {
  if (!value) return null;

  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};

const dayOffsetOf = (from: string | null, to: string | null): number => {
  const start = dayOf(from);
  const end = dayOf(to);
  if (start === null || end === null) return 0;
  return Math.round(end - start);
};

const airportOf = (
  value: unknown,
): { id: string | null; name: string | null; time: string | null } => {
  const record = asRecord(value);
  return {
    id: getString(record, "id"),
    name: getString(record, "name"),
    time: getString(record, "time"),
  };
};

const toFlightSegment = (item: unknown): FlightSegment => {
  const record = asRecord(item) ?? {};
  const departure = airportOf(record.departure_airport);
  const arrival = airportOf(record.arrival_airport);

  return {
    airline: getString(record, "airline"),
    flightNumber: getString(record, "flight_number"),
    airplane: getString(record, "airplane"),
    travelClass: getString(record, "travel_class"),
    departureId: departure.id,
    departureName: departure.name,
    departureAt: departure.time,
    departureTime: timeOf(departure.time),
    arrivalId: arrival.id,
    arrivalName: arrival.name,
    arrivalAt: arrival.time,
    arrivalTime: timeOf(arrival.time),
    duration: getNumber(record, "duration"),
  };
};

const toLayover = (item: unknown): Layover => {
  const record = asRecord(item) ?? {};
  return {
    id: getString(record, "id"),
    name: getString(record, "name"),
    duration: getNumber(record, "duration"),
    overnight: record.overnight === true,
  };
};

const toFlightOption = (item: unknown): FlightOption => {
  const record = asRecord(item) ?? {};
  const segments = recordsOf(record.flights).map(toFlightSegment);
  const layovers = recordsOf(record.layovers).map(toLayover);

  const first = segments[0];
  const last = segments[segments.length - 1];
  const airlines = [
    ...new Set(
      segments
        .map((segment) => segment.airline)
        .filter((airline): airline is string => airline !== null),
    ),
  ];

  return {
    airline: airlines.length > 0 ? airlines.join(" + ") : null,
    price: getNumber(record, "price"),
    type: getString(record, "type"),
    totalDuration: getNumber(record, "total_duration"),
    dayOffset: dayOffsetOf(first?.departureAt ?? null, last?.arrivalAt ?? null),
    segments,
    layovers,
    extensions: stringsOf(record.extensions),
  };
};

/* Hotels -------------------------------------------------------------------- */

const rateOf = (
  value: unknown,
): { amount: number | null; label: string | null } => {
  if (typeof value === "number") return { amount: value, label: null };

  const record = asRecord(value);
  if (!record) return { amount: null, label: null };

  return {
    amount:
      getNumber(record, "extracted_lowest") ?? getNumber(record, "extracted_price"),
    label: getString(record, "lowest") ?? getString(record, "price"),
  };
};

const toHotel = (item: unknown): Hotel => {
  const record = asRecord(item) ?? {};
  const nightly = rateOf(record.rate_per_night);
  const total = rateOf(record.total_rate);
  const hotelClass =
    getString(record, "hotel_class") ??
    (typeof record.hotel_class === "number"
      ? `${record.hotel_class}-star`
      : null);

  return {
    name: getString(record, "name"),
    link: getString(record, "link"),
    token: getString(record, "property_token"),
    rating: getNumber(record, "rating"),
    reviews: getNumber(record, "reviews"),
    hotelClass,
    pricePerNight: nightly.amount,
    priceLabel: nightly.label,
    totalPrice: total.amount,
    description: getString(record, "description"),
    amenities: stringsOf(record.amenities),
  };
};

/* Places -------------------------------------------------------------------- */

const toPlace = (item: unknown): Place => {
  const record = asRecord(item) ?? {};
  const types = stringsOf(record.types);

  return {
    title: getString(record, "title") ?? getString(record, "name"),
    type: getString(record, "type") ?? types[0] ?? null,
    types,
    address: getString(record, "address"),
    rating: getNumber(record, "rating"),
    reviews: getNumber(record, "reviews"),
    phone: getString(record, "phone"),
    website: getString(record, "website"),
    description: getString(record, "description"),
    openState: getString(record, "open_state"),
  };
};

/* Tools --------------------------------------------------------------------- */

const TRAVEL_CLASS: Record<string, number> = {
  economy: 1,
  premium_economy: 2,
  business: 3,
  first: 4,
};

export const searchTools = () => {
  const session = () => ensureSearchSession();

  return {
    web_search: composioTool({
      slug: "COMPOSIO_SEARCH_WEB",
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
      outputSchema: resultsOutput,
      session,
      args: ({ query }) => ({ query }),
      map: (data, input) => ({
        results: toResults(data, [
          "results.citations",
          "results.organic_results",
          "citations",
          "organic_results",
          "results",
        ]).slice(0, input.numResults ?? 5),
      }),
      errorResult: failed({ results: [] }),
    }),

    fetch_url: composioTool({
      slug: "COMPOSIO_SEARCH_FETCH_URL_CONTENT",
      title: "Fetch URL",
      description:
        "Fetch and read the content of a specific URL. Use this when you already have a URL and need its full text.",
      inputSchema: z.object({
        url: z.string().url().describe("The URL to fetch"),
      }),
      outputSchema: resultsOutput,
      session,
      args: ({ url }) => ({
        urls: [url],
        text: true,
        summary: true,
        max_characters: 8000,
      }),
      map: (data) => {
        const records = firstRecords(data, ["results", "contents", "documents"]);
        if (records.length > 0) {
          return { results: records.map(toSearchResult) };
        }

        const url = firstString(data, ["url", "link"]);
        const text =
          firstString(data, ["text", "content", "markdown"]) ??
          getString(asRecord(data), "summary");
        if (text || url) {
          return {
            results: [
              {
                title: url,
                url,
                snippet: null,
                text,
                date: null,
                author: null,
              },
            ],
          };
        }
        return { results: [] };
      },
      errorResult: failed({ results: [] }),
    }),

    news_search: composioTool({
      slug: "COMPOSIO_SEARCH_NEWS",
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
      outputSchema: resultsOutput,
      session,
      args: ({ query, when }) => compact({ query, when }),
      map: (data, input) => ({
        results: toResults(data, [
          "results.news_results",
          "news_results",
          "results",
        ]).slice(0, input.numResults ?? 5),
      }),
      errorResult: failed({ results: [] }),
    }),

    flight_search: composioTool({
      slug: "COMPOSIO_SEARCH_FLIGHTS",
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
      outputSchema: flightsOutput,
      session,
      args: ({
        departure_id,
        arrival_id,
        outbound_date,
        return_date,
        travel_class,
        query,
        ...rest
      }) =>
        compact({
          departure_id,
          arrival_id,
          outbound_date,
          return_date,
          travel_class: travel_class
            ? TRAVEL_CLASS[travel_class]
            : undefined,
          query,
          ...rest,
        }),
      map: (data, input) => ({
        best: firstRecords(data, ["best_flights"]).map(toFlightOption),
        other: firstRecords(data, ["other_flights"]).map(toFlightOption),
        currency: asString(findValue(data, "currency")) ?? input.currency ?? null,
      }),
      errorResult: (error) => ({
        best: [],
        other: [],
        currency: null,
        error: /departure airport|arrival airport|IATA/i.test(error)
          ? `${error} Resolve the city to an IATA code (e.g. with web_search) and retry using departure_id/arrival_id.`
          : error,
      }),
    }),

    hotel_search: composioTool({
      slug: "COMPOSIO_SEARCH_HOTELS",
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
      outputSchema: hotelsOutput,
      session,
      args: ({ q, check_in_date, check_out_date, ...rest }) =>
        compact({ q, check_in_date, check_out_date, ...rest }),
      map: (data, input) => ({
        hotels: firstRecords(data, ["properties", "hotels"]).map(toHotel),
        currency: asString(findValue(data, "currency")) ?? input.currency ?? null,
      }),
      errorResult: failed({ hotels: [], currency: null }),
    }),

    maps_search: composioTool({
      slug: "COMPOSIO_SEARCH_GOOGLE_MAPS",
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
      outputSchema: placesOutput,
      session,
      args: ({ q, ll }) => compact({ q, ll }),
      map: (data) => {
        const local = firstRecords(data, ["local_results"]);
        if (local.length > 0) {
          return { places: local.map(toPlace), single: false };
        }

        const place = firstRecord(data, ["place_results"]);
        if (place) return { places: [toPlace(place)], single: true };

        return { places: [], single: false };
      },
      errorResult: failed({ places: [], single: false }),
    }),
  };
};

export type SearchToolName = keyof ReturnType<typeof searchTools>;
