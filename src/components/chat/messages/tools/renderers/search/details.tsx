import type { FC } from "react";
import type {
  FlightsOutput,
  HotelsOutput,
  PlacesOutput,
  ResultsOutput,
} from "@/lib/ai/tools/search";
import type { RendererProps } from "../../types";
import { DetailGate, EmptyNote, RowList, SectionLabel } from "../../primitives";
import { formatCount } from "../../helpers";
import { type FlightOption } from "./helpers";
import {
  FetchBody,
  FlightCard,
  HotelCard,
  PlaceCard,
  ResultsDetail,
} from "./parts";

export const WebSearchDetail: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => (
  <ResultsDetail
    block={block}
    output={output}
    emptyLabel="No results found."
  />
);

export const NewsDetail: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => (
  <ResultsDetail
    block={block}
    output={output}
    emptyLabel="No articles found."
  />
);

export const FetchDetail: FC<RendererProps<ResultsOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Fetching page…">
    <FetchBody block={block} output={output} />
  </DetailGate>
);

const FlightGroup: FC<{
  label: string | null;
  flights: FlightOption[];
  currency: string | null;
}> = ({ label, flights, currency }) => {
  if (flights.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      {label ? (
        <SectionLabel>
          {label} · {formatCount(flights.length, "option")}
        </SectionLabel>
      ) : null}
      <RowList>
        {flights.map((flight, index) => (
          <FlightCard key={index} flight={flight} currency={currency} />
        ))}
      </RowList>
    </div>
  );
};

export const FlightDetail: FC<RendererProps<FlightsOutput>> = ({
  block,
  output,
}) => {
  const best = output?.best ?? [];
  const other = output?.other ?? [];
  const currency = output?.currency ?? null;
  const total = best.length + other.length;
  const showLabels = best.length > 0 && other.length > 0;

  return (
    <DetailGate block={block} executingLabel="Searching flights…">
      {total === 0 ? (
        <EmptyNote>No flights found.</EmptyNote>
      ) : (
        <div className="flex max-h-72 min-h-0 flex-col gap-3 overflow-y-auto scroll-fade-y">
          <FlightGroup
            label={showLabels ? "Best" : null}
            flights={best}
            currency={currency}
          />
          <FlightGroup
            label={showLabels ? "Other" : null}
            flights={other}
            currency={currency}
          />
        </div>
      )}
    </DetailGate>
  );
};

export const HotelDetail: FC<RendererProps<HotelsOutput>> = ({
  block,
  output,
}) => {
  const hotels = output?.hotels ?? [];
  const currency = output?.currency ?? null;

  return (
    <DetailGate block={block} executingLabel="Searching hotels…">
      {hotels.length === 0 ? (
        <EmptyNote>No hotels found.</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {hotels.map((hotel, index) => (
            <HotelCard
              key={hotel.token ?? index}
              hotel={hotel}
              currency={currency}
            />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

export const MapsDetail: FC<RendererProps<PlacesOutput>> = ({
  block,
  output,
}) => {
  const places = output?.places ?? [];
  const single = output?.single ?? false;

  return (
    <DetailGate block={block} executingLabel="Searching places…">
      {places.length === 0 ? (
        <EmptyNote>No places found.</EmptyNote>
      ) : (
        <RowList maxHeightClass={single ? undefined : "max-h-72"}>
          {places.map((place, index) => (
            <PlaceCard key={index} place={place} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};
