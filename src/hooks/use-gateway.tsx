import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { createGateway } from "ai";
import { useMemo } from "react";

export const useGateway = () => {
  const apiKey = useSettingsStore((state) => state.apiKey);

  const gateway = useMemo(() => {
    return createGateway({ apiKey, fetch: nativeFetch });
  }, [apiKey]);

  return gateway;
};
