import type { FC } from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DetailGate,
  EmptyNote,
  ListRow,
  MetaLine,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
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
      className="text-[10px] tabular-nums text-amber-500/80"
    >
      +{days}
    </span>
  );
};

const Endpoint: FC<{
  time: string | null;
  code: string | null;
  dayOffset?: number;
  className?: string;
}> = ({ time, code, dayOffset = 0, className }) => (
  <div className={cn("flex shrink-0 flex-col gap-0.5", className)}>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-medium tabular-nums text-foreground">
        {time ?? "—"}
      </span>
      <DayOffset days={dayOffset} />
    </div>
    <AirportCode code={code} />
  </div>
);

const RouteLine: FC<{
  stops: number;
  stopsLabel: string;
  duration: string | null;
}> = ({ stops, stopsLabel, duration }) => (
  <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1">
    {duration ? (
      <span className="text-[10px] tabular-nums text-muted-foreground/60">
        {duration}
      </span>
    ) : null}
    <div className="flex h-px w-full items-center justify-center bg-border">
      {stops > 0 ? (
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      ) : null}
    </div>
    <span className="text-[10px] text-muted-foreground/60">{stopsLabel}</span>
  </div>
);

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
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className={rowTitleClasses}>{flight.airline ?? "Flight"}</span>
          {numbers ? (
            <span className="min-w-0 truncate text-[10px] text-muted-foreground/50">
              {numbers}
            </span>
          ) : null}
        </div>
        {price ? <Price value={price} /> : null}
      </div>

      <div className="flex items-center gap-3">
        <Endpoint
          time={first?.departureTime ?? null}
          code={first?.departureId ?? null}
        />
        <RouteLine stops={stops} stopsLabel={stopsLabel} duration={duration} />
        <Endpoint
          time={last?.arrivalTime ?? null}
          code={last?.arrivalId ?? null}
          dayOffset={flight.dayOffset}
          className="items-end"
        />
      </div>

      <MetaLine items={[...layovers, flight.type]} />
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

const GroupLabel: FC<{ label: string; count: number }> = ({ label, count }) => (
  <p className="px-0.5 text-xs text-muted-foreground/70">
    {label} · {formatCount(count, "option")}
  </p>
);

const FlightGroup: FC<{
  label: string | null;
  flights: FlightOption[];
  currency: string | null;
}> = ({ label, flights, currency }) => {
  if (flights.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      {label ? <GroupLabel label={label} count={flights.length} /> : null}
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

export const renderer = defineRenderer<FlightSearchInput, FlightSearchOutput>({
  icon: Plane,
  title: "Searched flights",
  executingTitle: "Searching flights",
  surface: "card",
  inputSchema: flightSearchInput,
  outputSchema: flightSearchOutputSchema,
  Summary,
  Detail,
});
