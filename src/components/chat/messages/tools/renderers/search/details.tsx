import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DetailGate, EmptyNote, RowList, SectionLabel } from "../../primitives";
import { asRecord, formatCount, getString } from "../../helpers";
import { flightsOf, hotelsOf, placesOf, type FlightOption } from "./helpers";
import {
  FetchBody,
  FlightCard,
  HotelCard,
  PlaceCard,
  ResultsDetail,
} from "./parts";

export const WebSearchDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ResultsDetail block={block} emptyLabel="No results found." />
);

export const NewsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ResultsDetail block={block} emptyLabel="No articles found." />
);

export const FetchDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Fetching page…">
    <FetchBody block={block} />
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

export const FlightDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const flights = flightsOf(block.output);
  const currency = getString(asRecord(block.input), "currency");
  const total = flights.best.length + flights.other.length;
  const showLabels = flights.best.length > 0 && flights.other.length > 0;

  return (
    <DetailGate block={block} executingLabel="Searching flights…">
      {total === 0 ? (
        <EmptyNote>No flights found.</EmptyNote>
      ) : (
        <div className="flex max-h-72 min-h-0 flex-col gap-3 overflow-y-auto scroll-fade-y">
          <FlightGroup
            label={showLabels ? "Best" : null}
            flights={flights.best}
            currency={currency}
          />
          <FlightGroup
            label={showLabels ? "Other" : null}
            flights={flights.other}
            currency={currency}
          />
        </div>
      )}
    </DetailGate>
  );
};

export const HotelDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const hotels = hotelsOf(block.output);
  const currency = getString(asRecord(block.input), "currency");

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

export const MapsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { places, single } = placesOf(block.output);

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
