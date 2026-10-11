import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  CountSummary,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { asRecord, formatCount, getString, hostnameOf } from "../../helpers";
import {
  flightsOf,
  formatMoney,
  hotelsOf,
  lowestOf,
  placesOf,
  resultsOf,
  wordCountOf,
} from "./helpers";

export const WebSearchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "query")}
    count={resultsOf(block.output).length}
    noun="result"
  />
);

export const NewsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "query")}
    count={resultsOf(block.output).length}
    noun="article"
  />
);

export const MapsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "q")}
    count={placesOf(block.output).places.length}
    noun="place"
  />
);

export const FlightSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = asRecord(block.input);
  const from = getString(input, "departure_id");
  const to = getString(input, "arrival_id");
  const query = getString(input, "query");
  const label = from && to ? `${from} → ${to}` : query;
  const currency = getString(input, "currency");

  const flights = flightsOf(block.output);
  const options = [...flights.best, ...flights.other];
  const lowest = lowestOf(options.map((flight) => flight.price));
  const price = formatMoney(lowest, currency);

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>
          {price ? `from ${price}` : formatCount(options.length, "option")}
        </ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const HotelSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = asRecord(block.input);
  const q = getString(input, "q");
  const currency = getString(input, "currency");

  const hotels = hotelsOf(block.output);
  const lowest = lowestOf(hotels.map((hotel) => hotel.pricePerNight));
  const price = formatMoney(lowest, currency);

  return (
    <SummaryRow>
      {q ? <SummaryText title={q}>{q}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>
          {price ? `from ${price}` : formatCount(hotels.length, "hotel")}
        </ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const FetchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const url = getString(asRecord(block.input), "url");
  const page = resultsOf(block.output)[0];
  const body = page?.text ?? page?.snippet ?? null;
  const words = body ? formatCount(wordCountOf(body), "word") : null;

  return (
    <SummaryRow>
      {url ? <SummaryText title={url}>{hostnameOf(url)}</SummaryText> : null}
      <SummaryStatus block={block}>
        {page ? <ResultBadge>{words ?? "read"}</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};
