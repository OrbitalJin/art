import type { FC } from "react";
import { Plane } from "lucide-react";
import {
  Arrow,
  DetailGate,
  EmptyNote,
  ListRow,
  MetaLine,
  ResultBadge,
  RowList,
  SectionLabel,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import {
  formatDuration,
  formatMoney,
  lowestOf,
  type FlightOption,
  type Layover,
} from "./helpers";
import { Price, rowTitleClasses } from "./parts";
import { flightSearchInput, flightSearchOutputSchema } from "./schema";
import type { FlightSearchInput, FlightSearchOutput } from "./schema";

const AirportCode: FC<{ code: string | null }> = ({ code }) => {
  if (!code) return null;

  return (
    <span className="font-mono text-[10px] text-muted-foreground/60">
      {code}
    </span>
  );
};

const DayOffset: FC<{ days: number }> = ({ days }) => {
  if (days <= 0) return null;

  return (
    <span
      title={`Arrives ${formatCount(days, "day")} later`}
      className="-ml-1 text-[10px] tabular-nums text-amber-500/80"
    >
      +{days}
    </span>
  );
};

const layoverLabel = (layover: Layover): string => {
  const place = layover.id ?? layover.name ?? "Layover";
  const duration = formatDuration(layover.duration);
  const overnight = layover.overnight ? "overnight" : null;
  return [place, duration, overnight].filter(Boolean).join(" ");
};

const FlightCard: FC<{ flight: FlightOption; currency: string | null }> = ({
  flight,
  currency,
}) => {
  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];
  const stops = flight.segments.length - 1;
  const stopsLabel = stops <= 0 ? "Nonstop" : formatCount(stops, "stop");
  const price = formatMoney(flight.price, currency);
  const duration = formatDuration(flight.totalDuration);
  const layovers = flight.layovers.map(layoverLabel);
  const numbers = flight.segments
    .map((segment) => segment.flightNumber)
    .filter(Boolean)
    .join(", ");

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span className={rowTitleClasses}>{flight.airline ?? "Flight"}</span>
        {price ? <Price value={price} /> : null}
      </div>

      <div className="flex min-w-0 items-center gap-2 text-[11px] text-foreground/75">
        <span className="tabular-nums">{first?.departureTime ?? "—"}</span>
        <AirportCode code={first?.departureId ?? null} />
        <Arrow />
        <span className="tabular-nums">{last?.arrivalTime ?? "—"}</span>
        <DayOffset days={flight.dayOffset} />
        <AirportCode code={last?.arrivalId ?? null} />
        {duration ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
            {duration}
          </span>
        ) : null}
      </div>

      <MetaLine
        items={[stopsLabel, ...layovers, flight.type, numbers || null]}
      />
    </ListRow>
  );
};

const Summary: FC<RendererProps<FlightSearchInput, FlightSearchOutput>> = ({
  block,
  input,
  output,
}) => {
  const from = input?.departure_id ?? null;
  const to = input?.arrival_id ?? null;
  const label = from && to ? `${from} → ${to}` : (input?.query ?? null);

  const options = [...(output?.best ?? []), ...(output?.other ?? [])];
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

const Detail: FC<RendererProps<FlightSearchInput, FlightSearchOutput>> = ({
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

export const renderer: ToolRenderer<FlightSearchInput, FlightSearchOutput> = {
  icon: Plane,
  title: "Searched flights",
  executingTitle: "Searching flights",
  inputSchema: flightSearchInput,
  outputSchema: flightSearchOutputSchema,
  Summary,
  Detail,
};
