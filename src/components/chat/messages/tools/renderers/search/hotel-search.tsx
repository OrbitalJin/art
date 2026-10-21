import type { FC } from "react";
import { Hotel } from "lucide-react";
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
import { formatMoney, lowestOf, type Hotel as HotelResult } from "./helpers";
import { LinkTitle, Price, Rating } from "./parts";
import { hotelSearchInput, hotelSearchOutputSchema } from "./schema";
import type { HotelSearchInput, HotelSearchOutput } from "./schema";

const AmenityChip: FC<{ label: string }> = ({ label }) => (
  <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
    {label}
  </span>
);

const AmenityList: FC<{ amenities: string[] }> = ({ amenities }) => {
  if (amenities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {amenities.map((amenity, index) => (
        <AmenityChip key={`${amenity}-${index}`} label={amenity} />
      ))}
    </div>
  );
};

const NightlyPrice: FC<{
  nightly?: string | null;
  total?: string | null;
}> = ({ nightly, total }) => {
  if (!nightly && !total) return null;

  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      {nightly ? <Price value={nightly} suffix="/night" /> : null}
      {total ? (
        <span className="text-[10px] tabular-nums text-muted-foreground/60">
          {total} total
        </span>
      ) : null}
    </div>
  );
};

const HotelCard: FC<{ hotel: HotelResult; currency: string | null }> = ({
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <LinkTitle href={hotel.link} title={hotel.name ?? undefined}>
              {hotel.name ?? "Hotel"}
            </LinkTitle>
            <Rating rating={hotel.rating} />
          </div>
          <MetaLine items={[reviews, hotel.hotelClass]} />
        </div>

        <NightlyPrice nightly={nightly} total={total} />
      </div>

      {hotel.description ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {hotel.description}
        </p>
      ) : null}

      <AmenityList amenities={amenities} />
    </ListRow>
  );
};

const Summary: FC<RendererProps<HotelSearchInput, HotelSearchOutput>> = ({
  block,
  input,
  output,
}) => {
  const hotels = output?.hotels ?? [];
  const lowest = lowestOf(hotels.map((hotel) => hotel.pricePerNight));
  const price = formatMoney(lowest, output?.currency ?? null);

  return (
    <SummaryRow>
      {input?.q ? <SummaryText title={input.q}>{input.q}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>
          {price ? `from ${price}` : formatCount(hotels.length, "hotel")}
        </ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<HotelSearchInput, HotelSearchOutput>> = ({
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

export const renderer = defineRenderer<HotelSearchInput, HotelSearchOutput>({
  icon: Hotel,
  title: "Searched hotels",
  executingTitle: "Searching hotels",
  surface: "card",
  inputSchema: hotelSearchInput,
  outputSchema: hotelSearchOutputSchema,
  Summary,
  Detail,
});
