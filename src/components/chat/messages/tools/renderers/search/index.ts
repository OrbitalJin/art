import { Globe, Hotel, MapPin, Newspaper, Plane, Search } from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { SearchToolName } from "@/lib/ai/tools/search";
import {
  FetchDetail,
  FlightDetail,
  HotelDetail,
  MapsDetail,
  NewsDetail,
  WebSearchDetail,
} from "./details";
import {
  FetchSummary,
  FlightSummary,
  HotelSummary,
  MapsSummary,
  NewsSummary,
  WebSearchSummary,
} from "./summaries";

export const searchRenderers = {
  web_search: {
    icon: Search,
    title: "Searched the web",
    Summary: WebSearchSummary,
    Detail: WebSearchDetail,
  },
  fetch_url: {
    icon: Globe,
    title: "Fetched page",
    Summary: FetchSummary,
    Detail: FetchDetail,
  },
  news_search: {
    icon: Newspaper,
    title: "Searched news",
    Summary: NewsSummary,
    Detail: NewsDetail,
  },
  flight_search: {
    icon: Plane,
    title: "Searched flights",
    Summary: FlightSummary,
    Detail: FlightDetail,
  },
  hotel_search: {
    icon: Hotel,
    title: "Searched hotels",
    Summary: HotelSummary,
    Detail: HotelDetail,
  },
  maps_search: {
    icon: MapPin,
    title: "Searched places",
    Summary: MapsSummary,
    Detail: MapsDetail,
  },
} satisfies Record<SearchToolName, ToolRenderer>;
