import { useState, type FC } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { MetaLine, ResultBadge, SummaryRow, formatBytes } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

type ReadMediaInput = z.infer<typeof fileToolSchemas.read_image.input>;
type MediaOutput = z.infer<typeof fileToolSchemas.read_image.output>;

interface Dimensions {
  width: number;
  height: number;
}

const formatMediaType = (mediaType: string): string => {
  const subtype = mediaType.split("/")[1] ?? mediaType;
  const base = subtype.split("+")[0] ?? subtype;
  return base.toUpperCase();
};

const PreviewSkeleton: FC = () => (
  <div className="h-32 w-full animate-pulse rounded-lg border border-border/40 bg-muted/40" />
);

const ImagePreview: FC<{
  src: string;
  alt: string;
  onLoadDimensions: (dimensions: Dimensions) => void;
}> = ({ src, alt, onLoadDimensions }) => (
  <div className="flex w-fit max-w-full items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-1.5">
    <img
      src={src}
      alt={alt}
      onLoad={(event) =>
        onLoadDimensions({
          width: event.currentTarget.naturalWidth,
          height: event.currentTarget.naturalHeight,
        })
      }
      className="max-h-72 w-auto max-w-full rounded-md object-contain"
    />
  </div>
);

const Summary: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
  input,
  output,
}) => {
  const { path } = pathOf(input);

  return (
    <SummaryRow>
      <FileName path={path} />
      {output ? <ResultBadge>{formatBytes(output.size)}</ResultBadge> : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
  input,
  output,
}) => {
  const { folder, path } = pathOf(input);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  if (!output) {
    return (
      <div className="flex flex-col gap-2.5">
        <FilePath folder={folder} path={path} />
        <PreviewSkeleton />
      </div>
    );
  }

  const isImage = output.mediaType.startsWith("image/");
  const src = `data:${output.mediaType};base64,${output.base64}`;
  const typeLabel = formatMediaType(output.mediaType);
  const sizeLabel = formatBytes(output.size);
  const dimensionsLabel = dimensions
    ? `${dimensions.width} × ${dimensions.height}`
    : null;

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />

      {isImage ? (
        <ImagePreview
          src={src}
          alt={path ?? "image"}
          onLoadDimensions={setDimensions}
        />
      ) : null}

      <MetaLine items={[typeLabel, sizeLabel, dimensionsLabel]} />
    </div>
  );
};

export const renderer = defineRenderer<ReadMediaInput, MediaOutput>({
  icon: ImageIcon,
  title: "Read image",
  executingTitle: "Reading image",
  surface: "card",
  inputSchema: fileToolSchemas.read_image.input,
  outputSchema: fileToolSchemas.read_image.output,
  Summary,
  Detail,
});
