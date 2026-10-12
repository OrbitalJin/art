import type { FC } from "react";
import type {
  FlightsOutput,
  HotelsOutput,
  PlacesOutput,
  ResultsOutput,
} from "@/lib/ai/tools/search";
import type { RendererProps } from "../../types";
import {
  CountSummary,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { asRecord, formatCount, getString, hostnameOf } from "../../helpers";
import {
  formatMoney,
  lowestOf,
  wordCountOf,
} from "./helpers";

export const WebSearchSummary: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "query")}
    count={output?.results.length ?? 0}
    noun="result"
  />
);

export const NewsSummary: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "query")}
    count={output?.results.length ?? 0}
    noun="article"
  />
);

export const MapsSummary: FC<RendererProps<PlacesOutput>> = ({
  block,
  output,
}) => (
  <CountSummary
    block={block}
    label={getString(asRecord(block.input), "q")}
    count={output?.places.length ?? 0}
    noun="place"
  />
);

export const FlightSummary: FC<RendererProps<FlightsOutput>> = ({
  block,
  output,
}) => {
  const input = asRecord(block.input);
  const from = getString(input, "departure_id");
  const to = getString(input, "arrival_id");
  const query = getString(input, "query");
  const label = from && to ? `${from} → ${to}` : query;

  const best = output?.best ?? [];
  const other = output?.other ?? [];
  const options = [...best, ...other];
  const lowest = lowestOf(options.map((flight) => flight.price));
  const price = formatMoney(lowest, output?.currency ?? null);

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

export const HotelSummary: FC<RendererProps<HotelsOutput>> = ({
  block,
  output,
}) => {
  const input = asRecord(block.input);
  const q = getString(input, "q");

  const hotels = output?.hotels ?? [];
  const lowest = lowestOf(hotels.map((hotel) => hotel.pricePerNight));
  const price = formatMoney(lowest, output?.currency ?? null);

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

export const FetchSummary: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => {
  const url = getString(asRecord(block.input), "url");
  const page = output?.results[0];
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
