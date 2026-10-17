import type { FC } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CountSummary,
  DetailGate,
  EmptyNote,
  ListRow,
  MetaLine,
  RowList,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import type { Place } from "./helpers";
import { LinkTitle, Rating } from "./parts";
import { mapsSearchInput, mapsSearchOutputSchema } from "./schema";
import type { MapsSearchInput, MapsSearchOutput } from "./schema";

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

const PlaceCard: FC<{ place: Place }> = ({ place }) => {
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

const Summary: FC<RendererProps<MapsSearchInput, MapsSearchOutput>> = ({
  block,
  input,
  output,
}) => (
  <CountSummary
    block={block}
    label={input?.q ?? null}
    count={output?.places.length ?? 0}
    noun="place"
  />
);

const Detail: FC<RendererProps<MapsSearchInput, MapsSearchOutput>> = ({
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

export const renderer: ToolRenderer<MapsSearchInput, MapsSearchOutput> = {
  icon: MapPin,
  title: "Searched maps",
  executingTitle: "Searching maps",
  inputSchema: mapsSearchInput,
  outputSchema: mapsSearchOutputSchema,
  Summary,
  Detail,
};
