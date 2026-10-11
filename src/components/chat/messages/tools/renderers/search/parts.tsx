import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  Arrow,
  DateStamp,
  DetailGate,
  DetailTitle,
  EmptyNote,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import { formatCount, hostnameOf } from "../../helpers";
import {
  clipText,
  formatDuration,
  formatMoney,
  formatResultDate,
  resultsOf,
  wordCountOf,
  type FlightOption,
  type Hotel,
  type Layover,
  type Place,
  type WebResult,
} from "./helpers";

const PAGE_TEXT_LIMIT = 6000;

const rowTitleClasses =
  "min-w-0 truncate text-[12px] font-medium text-foreground/85 outline-none";

const LinkTitle: FC<{
  href: string | null;
  title?: string;
  children: ReactNode;
}> = ({ href, title, children }) => {
  if (!href) {
    return (
      <span title={title} className={rowTitleClasses}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={cn(
        rowTitleClasses,
        "hover:text-primary hover:underline focus-visible:underline",
      )}
    >
      {children}
    </a>
  );
};

export const Rating: FC<{ rating: number | null }> = ({ rating }) => {
  if (rating === null) return null;

  return (
    <span className="shrink-0 text-[11px] tabular-nums text-amber-500/90">
      ★ {rating.toFixed(1)}
    </span>
  );
};

const Price: FC<{ value: string; suffix?: string }> = ({ value, suffix }) => (
  <span
    className="ml-auto flex shrink-0 items-baseline gap-0.5"
    style={{ fontFamily: "monospace" }}
  >
    <span className="text-[12px] font-semibold tabular-nums text-foreground/90">
      {value}
    </span>
    {suffix ? (
      <span className="text-[10px] text-muted-foreground/50">{suffix}</span>
    ) : null}
  </span>
);

/* Web and news */

export const ResultItem: FC<{ result: WebResult }> = ({ result }) => {
  const title = result.title ?? "Untitled";
  const source = result.url ? hostnameOf(result.url) : null;
  const date = formatResultDate(result.date);

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <LinkTitle href={result.url} title={title}>
          {title}
        </LinkTitle>
        <DateStamp value={date} />
      </div>

      <MetaLine items={[source, result.author]} />

      {result.snippet ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {result.snippet}
        </p>
      ) : null}
    </ListRow>
  );
};

export const ResultsDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Searching…" }) => {
  const results = resultsOf(block.output);

  return (
    <DetailGate block={block} executingLabel={executingLabel}>
      {results.length === 0 ? (
        <EmptyNote>{emptyLabel}</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {results.map((result, index) => (
            <ResultItem key={index} result={result} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

/* Fetched page */

export const FetchBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const page = resultsOf(block.output)[0];
  if (!page) return <EmptyNote>No content returned.</EmptyNote>;

  const source = page.url ? hostnameOf(page.url) : null;
  const title = page.title ?? source ?? "Untitled page";
  const body = page.text ?? page.snippet;
  const words = body ? formatCount(wordCountOf(body), "word") : null;

  const link = page.url ? (
    <a
      href={page.url}
      target="_blank"
      rel="noreferrer"
      className="outline-none hover:text-primary hover:underline focus-visible:underline"
    >
      {source}
    </a>
  ) : null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <DetailTitle title={title} />
        <MetaLine items={[link, words]} />
      </div>

      {body ? (
        <div className="max-h-72 overflow-y-auto rounded-md border border-border/40 bg-muted/20 px-2.5 py-2 text-[11px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground/80">
          {clipText(body, PAGE_TEXT_LIMIT)}
        </div>
      ) : (
        <EmptyNote>No content returned.</EmptyNote>
      )}
    </div>
  );
};

/* Flights */

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

export const FlightCard: FC<{
  flight: FlightOption;
  currency: string | null;
}> = ({ flight, currency }) => {
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

/* Hotels */

export const HotelCard: FC<{ hotel: Hotel; currency: string | null }> = ({
  hotel,
  currency,
}) => {
  const nightly =
    formatMoney(hotel.pricePerNight, currency) ?? hotel.priceLabel;
  const total = formatMoney(hotel.totalPrice, currency);
  const reviews =
    hotel.reviews !== null ? formatCount(hotel.reviews, "review") : null;
  const amenities = hotel.amenities.slice(0, 4);

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <LinkTitle href={hotel.link} title={hotel.name ?? undefined}>
          {hotel.name ?? "Hotel"}
        </LinkTitle>
        <Rating rating={hotel.rating} />
        {nightly ? <Price value={nightly} suffix="/night" /> : null}
      </div>

      <MetaLine
        items={[reviews, hotel.hotelClass, total ? `${total} total` : null]}
      />

      {hotel.description ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {hotel.description}
        </p>
      ) : null}

      <MetaLine items={amenities} />
    </ListRow>
  );
};

/* Places */

const OpenState: FC<{ value: string }> = ({ value }) => {
  const open = /^open/i.test(value);

  return (
    <span
      className={cn(open && "text-emerald-600/90 dark:text-emerald-400/90")}
    >
      {value}
    </span>
  );
};

export const PlaceCard: FC<{ place: Place }> = ({ place }) => {
  const reviews =
    place.reviews !== null ? formatCount(place.reviews, "review") : null;

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <LinkTitle href={place.website} title={place.title ?? undefined}>
          {place.title ?? "Place"}
        </LinkTitle>
        <Rating rating={place.rating} />
      </div>

      <MetaLine
        items={[
          place.type,
          reviews,
          place.openState ? <OpenState value={place.openState} /> : null,
        ]}
      />

      <MetaLine items={[place.address, place.phone]} />

      {place.description ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {place.description}
        </p>
      ) : null}
    </ListRow>
  );
};
