import { Globe, Hotel, MapPin, Newspaper, Plane, Search } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  flightsOutput,
  hotelsOutput,
  placesOutput,
  resultsOutput,
  type SearchToolName,
} from "@/lib/ai/tools/search";
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
    schema: resultsOutput,
    Summary: WebSearchSummary,
    Detail: WebSearchDetail,
  },
  fetch_url: {
    icon: Globe,
    title: "Fetched page",
    schema: resultsOutput,
    Summary: FetchSummary,
    Detail: FetchDetail,
  },
  news_search: {
    icon: Newspaper,
    title: "Searched news",
    schema: resultsOutput,
    Summary: NewsSummary,
    Detail: NewsDetail,
  },
  flight_search: {
    icon: Plane,
    title: "Searched flights",
    schema: flightsOutput,
    Summary: FlightSummary,
    Detail: FlightDetail,
  },
  hotel_search: {
    icon: Hotel,
    title: "Searched hotels",
    schema: hotelsOutput,
    Summary: HotelSummary,
    Detail: HotelDetail,
  },
  maps_search: {
    icon: MapPin,
    title: "Searched places",
    schema: placesOutput,
    Summary: MapsSummary,
    Detail: MapsDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<SearchToolName, ToolRenderer<any>>;
