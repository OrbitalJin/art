import { z } from "zod";

/**
 * Search renderers consume Composio's Vercel tools directly, so the raw tool
 * output is the execution envelope `{ data, error, successful, logId }`. We
 * parse the envelope once here and map `data` into the shapes the search parts
 * render, keeping the UI decoupled from the backend payload.
 */
const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    error: z.string().nullish(),
    successful: z.boolean().optional(),
    logId: z.string().nullish(),
  });

/* Inputs -------------------------------------------------------------------- */

export const webSearchInput = z
  .object({ query: z.string().optional() })
  .loose();
export type WebSearchInput = z.infer<typeof webSearchInput>;

export const fetchUrlInput = z
  .object({
    urls: z.array(z.string()).optional(),
    text: z.boolean().optional(),
    max_characters: z.number().optional(),
  })
  .loose();
export type FetchUrlInput = z.infer<typeof fetchUrlInput>;

export const newsSearchInput = z
  .object({
    query: z.string().optional(),
    when: z.string().optional(),
    gl: z.string().optional(),
    hl: z.string().optional(),
    start: z.number().optional(),
  })
  .loose();
export type NewsSearchInput = z.infer<typeof newsSearchInput>;

export const flightSearchInput = z
  .object({
    query: z.string().optional(),
    departure_id: z.string().optional(),
    arrival_id: z.string().optional(),
    outbound_date: z.string().optional(),
    return_date: z.string().optional(),
    travel_class: z.number().optional(),
    adults: z.number().optional(),
    children: z.number().optional(),
    infants: z.number().optional(),
    currency: z.string().optional(),
  })
  .loose();
export type FlightSearchInput = z.infer<typeof flightSearchInput>;

export const hotelSearchInput = z
  .object({
    q: z.string().optional(),
    check_in_date: z.string().optional(),
    check_out_date: z.string().optional(),
    adults: z.number().optional(),
    children: z.number().optional(),
    currency: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
  })
  .loose();
export type HotelSearchInput = z.infer<typeof hotelSearchInput>;

export const mapsSearchInput = z
  .object({
    q: z.string().optional(),
    ll: z.string().optional(),
    start: z.number().optional(),
  })
  .loose();
export type MapsSearchInput = z.infer<typeof mapsSearchInput>;

/* View models --------------------------------------------------------------- */

export interface SearchResult {
  title: string | null;
  url: string | null;
  snippet: string | null;
  text: string | null;
  date: string | null;
  author: string | null;
}

export interface FlightSegment {
  airline: string | null;
  flightNumber: string | null;
  airplane: string | null;
  travelClass: string | null;
  departureId: string | null;
  departureName: string | null;
  departureAt: string | null;
  departureTime: string | null;
  arrivalId: string | null;
  arrivalName: string | null;
  arrivalAt: string | null;
  arrivalTime: string | null;
  duration: number | null;
}

export interface Layover {
  id: string | null;
  name: string | null;
  duration: number | null;
  overnight: boolean;
}

export interface FlightOption {
  airline: string | null;
  price: number | null;
  type: string | null;
  totalDuration: number | null;
  dayOffset: number;
  segments: FlightSegment[];
  layovers: Layover[];
  extensions: string[];
}

export interface Hotel {
  name: string | null;
  link: string | null;
  token: string | null;
  rating: number | null;
  reviews: number | null;
  hotelClass: string | null;
  pricePerNight: number | null;
  priceLabel: string | null;
  totalPrice: number | null;
  description: string | null;
  amenities: string[];
}

export interface Place {
  title: string | null;
  type: string | null;
  types: string[];
  address: string | null;
  rating: number | null;
  reviews: number | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  openState: string | null;
}

/* Web ----------------------------------------------------------------------- */

const citationSchema = z
  .object({
    url: z.string().nullish(),
    title: z.string().nullish(),
    author: z.string().nullish(),
    publishedDate: z.string().nullish(),
  })
  .loose();

export const webSearchOutputSchema = envelope(
  z
    .object({
      answer: z.string().nullish(),
      citations: z.array(citationSchema).nullish(),
    })
    .nullish(),
).transform(({ data }) => ({
  answer: data?.answer ?? null,
  results: (data?.citations ?? []).map<SearchResult>((citation) => ({
    title: citation.title ?? citation.url ?? null,
    url: citation.url ?? null,
    snippet: null,
    text: null,
    date: citation.publishedDate ?? null,
    author: citation.author ?? null,
  })),
}));
export type WebSearchOutput = z.infer<typeof webSearchOutputSchema>;

/* Fetch URL ----------------------------------------------------------------- */

const contentResultSchema = z
  .object({
    url: z.string().nullish(),
    title: z.string().nullish(),
    author: z.string().nullish(),
    text: z.string().nullish(),
    summary: z.string().nullish(),
    publishedDate: z.string().nullish(),
  })
  .loose();

export const fetchUrlOutputSchema = envelope(
  z
    .object({ results: z.array(contentResultSchema).nullish() })
    .nullish(),
).transform(({ data }) => ({
  results: (data?.results ?? []).map<SearchResult>((result) => ({
    title: result.title ?? result.url ?? null,
    url: result.url ?? null,
    snippet: result.summary ?? null,
    text: result.text ?? null,
    date: result.publishedDate ?? null,
    author: result.author ?? null,
  })),
}));
export type FetchUrlOutput = z.infer<typeof fetchUrlOutputSchema>;

/* News ---------------------------------------------------------------------- */

const newsArticleSchema = z
  .object({
    title: z.string().nullish(),
    link: z.string().nullish(),
    source: z.string().nullish(),
    date: z.string().nullish(),
    snippet: z.string().nullish(),
    published_at: z.string().nullish(),
  })
  .loose();

export const newsSearchOutputSchema = envelope(
  z
    .object({ news_results: z.array(newsArticleSchema).nullish() })
    .nullish(),
).transform(({ data }) => ({
  results: (data?.news_results ?? []).map<SearchResult>((article) => ({
    title: article.title ?? article.link ?? null,
    url: article.link ?? null,
    snippet: article.snippet ?? null,
    text: null,
    date: article.date ?? article.published_at ?? null,
    author: article.source ?? null,
  })),
}));
export type NewsSearchOutput = z.infer<typeof newsSearchOutputSchema>;

/* Flights ------------------------------------------------------------------- */

/** `"2026-03-03 10:10"` / `"2026-03-03T10:10"` -> `"10:10"`. */
const timeOf = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
};

/** Days since epoch for the `YYYY-MM-DD` part of a timestamp. */
const dayOf = (value: string | null | undefined): number | null => {
  if (!value) return null;

  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  return (
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) /
    86_400_000
  );
};

const dayOffsetOf = (
  from: string | null | undefined,
  to: string | null | undefined,
): number => {
  const start = dayOf(from);
  const end = dayOf(to);
  if (start === null || end === null) return 0;
  return Math.round(end - start);
};

const airportSchema = z
  .object({
    id: z.string().nullish(),
    name: z.string().nullish(),
    time: z.string().nullish(),
  })
  .loose();

const flightSegmentSchema = z
  .object({
    airline: z.string().nullish(),
    flight_number: z.string().nullish(),
    airplane: z.string().nullish(),
    travel_class: z.string().nullish(),
    departure_airport: airportSchema.nullish(),
    arrival_airport: airportSchema.nullish(),
    duration: z.number().nullish(),
  })
  .loose();

const layoverSchema = z
  .object({
    id: z.string().nullish(),
    name: z.string().nullish(),
    duration: z.number().nullish(),
    overnight: z.boolean().nullish(),
  })
  .loose();

const flightOptionSchema = z
  .object({
    price: z.number().nullish(),
    type: z.string().nullish(),
    total_duration: z.number().nullish(),
    flights: z.array(flightSegmentSchema).nullish(),
    layovers: z.array(layoverSchema).nullish(),
    extensions: z.array(z.string()).nullish(),
  })
  .loose();

const toFlightOption = (
  option: z.infer<typeof flightOptionSchema>,
): FlightOption => {
  const segments = (option.flights ?? []).map<FlightSegment>((segment) => {
    const departure = segment.departure_airport;
    const arrival = segment.arrival_airport;

    return {
      airline: segment.airline ?? null,
      flightNumber: segment.flight_number ?? null,
      airplane: segment.airplane ?? null,
      travelClass: segment.travel_class ?? null,
      departureId: departure?.id ?? null,
      departureName: departure?.name ?? null,
      departureAt: departure?.time ?? null,
      departureTime: timeOf(departure?.time),
      arrivalId: arrival?.id ?? null,
      arrivalName: arrival?.name ?? null,
      arrivalAt: arrival?.time ?? null,
      arrivalTime: timeOf(arrival?.time),
      duration: segment.duration ?? null,
    };
  });

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
    price: option.price ?? null,
    type: option.type ?? null,
    totalDuration: option.total_duration ?? null,
    dayOffset: dayOffsetOf(first?.departureAt, last?.arrivalAt),
    segments,
    layovers: (option.layovers ?? []).map<Layover>((layover) => ({
      id: layover.id ?? null,
      name: layover.name ?? null,
      duration: layover.duration ?? null,
      overnight: layover.overnight === true,
    })),
    extensions: option.extensions ?? [],
  };
};

export const flightSearchOutputSchema = envelope(
  z
    .object({
      results: z
        .object({
          best_flights: z.array(flightOptionSchema).nullish(),
          other_flights: z.array(flightOptionSchema).nullish(),
          search_parameters: z
            .object({ currency: z.string().nullish() })
            .loose()
            .nullish(),
        })
        .loose()
        .nullish(),
    })
    .nullish(),
).transform(({ data }) => {
  const results = data?.results;

  return {
    best: (results?.best_flights ?? []).map(toFlightOption),
    other: (results?.other_flights ?? []).map(toFlightOption),
    currency: results?.search_parameters?.currency ?? null,
  };
});
export type FlightSearchOutput = z.infer<typeof flightSearchOutputSchema>;

/* Hotels -------------------------------------------------------------------- */

const rateInfoSchema = z
  .object({
    lowest: z.string().nullish(),
    extracted_lowest: z.number().nullish(),
  })
  .loose();

const propertySchema = z
  .object({
    name: z.string().nullish(),
    link: z.string().nullish(),
    property_token: z.string().nullish(),
    overall_rating: z.number().nullish(),
    reviews: z.number().nullish(),
    hotel_class: z.string().nullish(),
    extracted_hotel_class: z.number().nullish(),
    description: z.string().nullish(),
    amenities: z.array(z.string()).nullish(),
    rate_per_night: rateInfoSchema.nullish(),
    total_rate: rateInfoSchema.nullish(),
  })
  .loose();

export const hotelSearchOutputSchema = envelope(
  z
    .object({
      results: z
        .object({
          properties: z.array(propertySchema).nullish(),
          search_parameters: z
            .object({ currency: z.string().nullish() })
            .loose()
            .nullish(),
        })
        .loose()
        .nullish(),
    })
    .nullish(),
).transform(({ data }) => {
  const results = data?.results;
  const hotelClass = (
    property: z.infer<typeof propertySchema>,
  ): string | null =>
    property.hotel_class ??
    (property.extracted_hotel_class != null
      ? `${property.extracted_hotel_class}-star`
      : null);

  return {
    hotels: (results?.properties ?? []).map<Hotel>((property) => ({
      name: property.name ?? null,
      link: property.link ?? null,
      token: property.property_token ?? null,
      rating: property.overall_rating ?? null,
      reviews: property.reviews ?? null,
      hotelClass: hotelClass(property),
      pricePerNight: property.rate_per_night?.extracted_lowest ?? null,
      priceLabel: property.rate_per_night?.lowest ?? null,
      totalPrice: property.total_rate?.extracted_lowest ?? null,
      description: property.description ?? null,
      amenities: property.amenities ?? [],
    })),
    currency: results?.search_parameters?.currency ?? null,
  };
});
export type HotelSearchOutput = z.infer<typeof hotelSearchOutputSchema>;

/* Maps ---------------------------------------------------------------------- */

const localResultSchema = z
  .object({
    title: z.string().nullish(),
    type: z.string().nullish(),
    types: z.array(z.string()).nullish(),
    address: z.string().nullish(),
    rating: z.number().nullish(),
    reviews: z.number().nullish(),
    phone: z.string().nullish(),
    website: z.string().nullish(),
    description: z.string().nullish(),
    open_state: z.string().nullish(),
  })
  .loose();

export const mapsSearchOutputSchema = envelope(
  z
    .object({
      results: z
        .object({ local_results: z.array(localResultSchema).nullish() })
        .loose()
        .nullish(),
    })
    .nullish(),
).transform(({ data }) => ({
  places: (data?.results?.local_results ?? []).map<Place>((place) => ({
    title: place.title ?? null,
    type: place.type ?? place.types?.[0] ?? null,
    types: place.types ?? [],
    address: place.address ?? null,
    rating: place.rating ?? null,
    reviews: place.reviews ?? null,
    phone: place.phone ?? null,
    website: place.website ?? null,
    description: place.description ?? null,
    openState: place.open_state ?? null,
  })),
  single: false,
}));
export type MapsSearchOutput = z.infer<typeof mapsSearchOutputSchema>;
