import { useEffect, useRef, useState } from "react";

interface Metadata {
  title: string;
  author: string;
}

export const isYoutubeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
};

const fetchYoutubeMetadata = async (url: string) => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error("Failed to fetch metadata");
    const data = await res.json();
    return { title: data.title as string, author: data.author_name as string };
  } catch {
    return { title: "", author: "" };
  }
};

export const useAudioMetadata = (urls: string[]) => {
  const [metadata, setMetadata] = useState<Record<string, Metadata>>({});
  const fetchedRef = useRef(new Set<string>());

  useEffect(() => {
    for (const url of urls) {
      if (!fetchedRef.current.has(url)) {
        fetchedRef.current.add(url);
        fetchYoutubeMetadata(url).then((meta) => {
          setMetadata((prev) => ({ ...prev, [url]: meta }));
        });
      }
    }
  }, [urls]);

  return metadata;
};
