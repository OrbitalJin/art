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
import type { RendererProps, ToolRenderer } from "../../types";
import { formatMoney, lowestOf, type Hotel as HotelResult } from "./helpers";
import { LinkTitle, Price, Rating } from "./parts";
import { hotelSearchInput, hotelSearchOutputSchema } from "./schema";
import type { HotelSearchInput, HotelSearchOutput } from "./schema";

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

export const renderer: ToolRenderer<HotelSearchInput, HotelSearchOutput> = {
  icon: Hotel,
  title: "Searched hotels",
  executingTitle: "Searching hotels",
  inputSchema: hotelSearchInput,
  outputSchema: hotelSearchOutputSchema,
  Summary,
  Detail,
};
