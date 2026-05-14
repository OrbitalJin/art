import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split(/[?&#]/)[0];
    }

    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export type ThumbnailQuality =
  | "maxresdefault"
  | "hqdefault"
  | "mqdefault"
  | "default";

export function getYoutubeThumbnail(
  url: string,
  quality: ThumbnailQuality = "mqdefault",
): string | null {
  const id = extractVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export const formatDateAsAgo = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString();
};

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
}
