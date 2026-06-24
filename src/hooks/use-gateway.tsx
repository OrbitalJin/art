import { useSettingsStore } from "@/lib/store/use-settings-store";
import { createGateway } from "ai";
import { useMemo } from "react";

export const useGateway = () => {
  const apiKey = useSettingsStore((state) => state.apiKey);

  const gateway = useMemo(() => {
    return createGateway({
      apiKey,
      fetch: (url, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("User-Agent");
        return fetch(url, { ...init, headers });
      },
    });
  }, [apiKey]);

  return gateway;
};
