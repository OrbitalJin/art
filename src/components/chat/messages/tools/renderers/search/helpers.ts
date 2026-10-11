import {
  asRecord,
  formatDate,
  getNumber,
  getString,
  recordsOf,
  stringsOf,
} from "../../helpers";

/* Results */

export interface WebResult {
  title: string | null;
  url: string | null;
  snippet: string | null;
  text: string | null;
  date: string | null;
  author: string | null;
}

const toResult = (record: Record<string, unknown>): WebResult => {
  const highlight = stringsOf(record.highlights)[0] ?? null;

  return {
    title: getString(record, "title"),
    url: getString(record, "url"),
    snippet:
      getString(record, "summary") ?? getString(record, "text") ?? highlight,
    text: getString(record, "text"),
    date: getString(record, "publishedDate"),
    author: getString(record, "author"),
  };
};

export const resultsOf = (output: unknown): WebResult[] =>
  recordsOf(asRecord(output)?.results).map(toResult);

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

/* Envelope walking */

/** Parses a JSON string when the value looks like an object or array. */
const parseJson = (value: unknown): unknown => {
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

  const value = parseJson(input);

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

/* Formatting */

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

  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Unknown currency code — fall through to a plain number.
    }
  }

  return amount.toLocaleString();
};

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

/* Flights */

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

const toSegment = (item: unknown): FlightSegment => {
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
  const segments = recordsOf(record.flights).map(toSegment);
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

export interface Flights {
  best: FlightOption[];
  other: FlightOption[];
}

export const flightsOf = (output: unknown): Flights => ({
  best: firstRecords(output, ["best_flights"]).map(toFlightOption),
  other: firstRecords(output, ["other_flights"]).map(toFlightOption),
});

/* Hotels */

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

const rateOf = (
  value: unknown,
): { amount: number | null; label: string | null } => {
  if (typeof value === "number") return { amount: value, label: null };

  const record = asRecord(value);
  if (!record) return { amount: null, label: null };

  return {
    amount:
      getNumber(record, "extracted_lowest") ??
      getNumber(record, "extracted_price"),
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

export const hotelsOf = (output: unknown): Hotel[] =>
  firstRecords(output, ["properties", "hotels"]).map(toHotel);

/* Places */

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

export interface Places {
  places: Place[];
  single: boolean;
}

export const placesOf = (output: unknown): Places => {
  const local = firstRecords(output, ["local_results"]);
  if (local.length > 0) return { places: local.map(toPlace), single: false };

  const place = firstRecord(output, ["place_results"]);
  if (place) return { places: [toPlace(place)], single: true };

  return { places: [], single: false };
};
