import type { FC } from "react";
import { MapPin, Phone, type LucideIcon } from "lucide-react";
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
import { defineRenderer, type RendererProps } from "../../types";
import type { Place } from "./helpers";
import { LinkTitle, Rating } from "./parts";
import { mapsSearchInput, mapsSearchOutputSchema } from "./schema";
import type { MapsSearchInput, MapsSearchOutput } from "./schema";

const toneOf = (value: string): { dot: string; text: string } => {
  if (/^open/i.test(value)) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-600/90 dark:text-emerald-400/90",
    };
  }

  if (/^closed/i.test(value)) {
    return {
      dot: "bg-rose-400",
      text: "text-rose-500/90 dark:text-rose-400/90",
    };
  }

  return { dot: "bg-muted-foreground/40", text: "" };
};

const OpenState: FC<{ value: string }> = ({ value }) => {
  const tone = toneOf(value);

  return (
    <span className={cn("inline-flex items-center gap-1.5", tone.text)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {value}
    </span>
  );
};

const DetailLine: FC<{ icon: LucideIcon; text: string }> = ({
  icon: Icon,
  text,
}) => (
  <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground/70">
    <Icon aria-hidden className="size-3 shrink-0 text-muted-foreground/50" />
    <span className="min-w-0 truncate" title={text}>
      {text}
    </span>
  </div>
);

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

      {place.address ? <DetailLine icon={MapPin} text={place.address} /> : null}
      {place.phone ? <DetailLine icon={Phone} text={place.phone} /> : null}

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

export const renderer = defineRenderer<MapsSearchInput, MapsSearchOutput>({
  icon: MapPin,
  title: "Searched maps",
  executingTitle: "Searching maps",
  surface: "card",
  inputSchema: mapsSearchInput,
  outputSchema: mapsSearchOutputSchema,
  Summary,
  Detail,
});
